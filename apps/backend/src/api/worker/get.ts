import { Request, Response } from "express";
import prisma from "../../prisma";
import { cache } from "../../cache";
import { Worker as workerFromCache } from "../../cache/worker";
import { Worker as workerFromDatabase } from "@prisma/client";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";
import validateSchema, { MapSchema } from "../../lib/validateSchema";

async function handle(req: Request, res: Response) {
  const query = req.query as { workerId: string };

  const schema = {
    workerId: "string",
  } as const;

  type mappedSchema = MapSchema<typeof schema>;

  let validationResult = await validateSchema<mappedSchema>(schema, query);

  if (validationResult) {
    res.statusCode = 400;
    return res.json({
      error: "Validation Error",
      reason: validationResult,
    });
  }

  if (!req.user) {
    res.statusCode = 401;
    return res.json({
      error: "Unauthorized.",
      reason: "Session Required.",
    });
  }

  let worker: workerFromCache | workerFromDatabase | null = cache.getWorker(
    query.workerId
  );

  if (worker) worker = worker.get();

  if (!worker) {
    worker = await prisma.worker.findFirst({
      where: {
        id: query.workerId,
      },
    });
  }

  if (!worker) {
    return res.json({
      error: "Worker not found.",
    });
  }

  if (
    req.user.id != worker.userId &&
    !getRolesPermissions(req.user.roles).includes(
      permission.ADMIN_ACCESS_WORKERS
    )
  ) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Insufficient Authorization.",
    });
  }

  res.json(worker);
}

export default handle;
