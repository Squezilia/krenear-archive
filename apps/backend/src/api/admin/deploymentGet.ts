import { Request, Response } from "express";
import prisma from "../../prisma";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";

async function handle(req: Request, res: Response) {
  const query = req.query;

  if (!req.user) {
    res.statusCode = 401;
    return res.json({
      error: "Unauthorized.",
      reason: "Session Required.",
    });
  }

  if (
    !getRolesPermissions(req.user.roles).includes(permission.ADMIN_MANAGE_DEPLOYMENTS)
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

  if (query.owner && typeof query.owner != "string") {
    res.statusCode = 400;
    return res.json({
      error: "Owner ID must be a string.",
      reason: `Type of "owner" is "${typeof query.owner}".`,
    });
  }

  let deployments = await prisma.deployment.findMany({
    where: {
      id: query.target,
      ownerId: query.owner,
    },
    include: {
      records: query.records != undefined,
    },
  });

  res.json(deployments);
}

export default handle;
