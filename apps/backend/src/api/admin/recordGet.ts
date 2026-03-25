import { Request, Response } from "express";
import prisma from "../../prisma";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";

async function handle(req: Request, res: Response) {
  const query = req.query as {target: string, deployment: string, parent: string};

  if (!req.user) {
    res.statusCode = 401;
    return res.json({
      error: "Unauthorized.",
      reason: "Session Required.",
    });
  }

  if (
    !getRolesPermissions(req.user.roles).includes(
      permission.ADMIN_MANAGE_RECORDS
    )
  ) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Insufficient Authorization.",
    });
  }

  if (query.target && typeof query.target != "string") {
    res.statusCode = 400;
    return res.json({
      error: "Target must be a string.",
      reason: `Type of "target" is "${typeof query.target}".`,
    });
  }

  if (query.deployment && typeof query.deployment != "string") {
    res.statusCode = 400;
    return res.json({
      error: "Deployment ID must be a string.",
      reason: `Type of "deployment" is "${typeof query.deployment}".`,
    });
  }

  let deployments = await prisma.record.findMany({
    where: {
      id: query.target,
      deploymentId: query.deployment,
    },
    include: {
      Deployment: query.parent != undefined,
    },
  });

  res.json(deployments);
}

export default handle;
