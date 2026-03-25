import { Request, Response } from "express";
import prisma from "../../prisma";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";
import validateSchema, { MapSchema } from "../../lib/validateSchema";

async function handle(req: Request, res: Response) {
  const query = req.query as {
    deploymentId: string | undefined;
    workers: string | undefined;
    schemas: string | undefined;
    records: string | undefined;
  };

  const schema = {
    deploymentId: "string?",
    workers: "string?",
    schemas: "string?",
    records: "string?",
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

  if (
    !getRolesPermissions(req.user.roles).includes(permission.USER_MANAGE_DEPLOYMENTS)
  ) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Insufficient Authorization.",
    });
  }

  let deployments = await prisma.deployment.findMany({
    where: {
      ownerId: req.user.id,
      id: query.deploymentId,
    },
    include: {
      workers: query.workers != undefined,
      schemas: query.schemas != undefined,
      records: query.records != undefined,
    },
  });

  res.json(deployments);
}

export default handle;
