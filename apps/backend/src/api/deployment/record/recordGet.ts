import { Request, Response } from "express";
import prisma from "../../../prisma";
import { getRolesPermissions } from "../../../perm";
import { permission } from "../../../perm/perms";
import validateSchema, { MapSchema } from "../../../lib/validateSchema";

async function handle(req: Request, res: Response) {
  const query = req.query as {
    deploymentId: string;
    target: string | undefined;
    parent: string | undefined;
    schema: string | undefined;
  };

  const schema = {
    deploymentId: "string",
    target: "string?",
    parent: "string?",
    schema: "string?",
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
    !getRolesPermissions(req.user.roles).includes(
      permission.USER_MANAGE_RECORDS
    )
  ) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Insufficient Authorization.",
    });
  }

  let deployments = await prisma.record.findMany({
    where: {
      id: query.target,
      Deployment: {
        id: query.deploymentId,
        ownerId: req.user.id,
      },
    },
    include: {
      Deployment: query.parent != undefined,
      schema: query.schema != undefined,
    },
  });

  res.json(deployments);
}

export default handle;
