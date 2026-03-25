import { Request, Response } from "express";

import { cache } from "../../cache";
import prisma from "../../prisma";

import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";

import deleteDeployment from "../../scripts/deleteDeployment";
import validateSchema, { MapSchema } from "../../lib/validateSchema";

async function handle(req: Request, res: Response) {
  const body: { deploymentId: string } = await req.body;

  const schema = {
    deploymentId: "string",
  } as const;

  type mappedSchema = MapSchema<typeof schema>;

  let validationResult = await validateSchema<mappedSchema>(schema, body);

  if (validationResult) {
    res.statusCode = 400;
    return res.json({
      error: "Validation Error",
      reason: validationResult,
    });
  }

  if (!req.user) {
    res.statusCode = 401;
    res.json({
      error: "Unauthorized.",
      reason: "Session Required.",
    });
    return;
  }

  if (
    !getRolesPermissions(req.user.roles).includes(permission.USER_MANAGE_DEPLOYMENTS)
  ) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Insufficient Authorization.",
    });
  }

  let existing = await prisma.deployment.findFirst({
    where: {
      id: body.deploymentId,
      ownerId: req.user.id,
    },
  });

  if (!existing) {
    res.statusCode = 400;
    return res.json({
      error: "Deployment is not existing.",
      reason: "Given deployment is not existing in the database.",
    });
  }

  const worker = cache.createWorker("krenear.deleteDeployment", req.user.id, null);

  deleteDeployment(worker, body.deploymentId).then(async () => {
    await prisma.record.deleteMany({
      where: {
        deploymentId: body.deploymentId,
      },
    });

    await prisma.worker.deleteMany({
      where: {
        deploymentId: body.deploymentId,
      },
    });

    await prisma.schema.deleteMany({
      where: {
        deploymentId: body.deploymentId,
      },
    });

    await prisma.deployment.delete({
      where: {
        id: body.deploymentId,
        ownerId: req.user!.id,
      },
      include: {
        records: true,
        workers: true,
        schemas: true,
      },
    });

    worker.stop();
  });

  res.statusCode = 200;
  res.json({ workerId: worker.id });
}

export default handle;
