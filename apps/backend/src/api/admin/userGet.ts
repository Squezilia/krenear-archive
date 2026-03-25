import { Request, Response } from "express";
import prisma from "../../prisma";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";

async function handle(req: Request, res: Response) {
  const query = req.query as { target: string, deployments: string };

  if (!req.user) {
    res.statusCode = 401;
    return res.json({
      error: "Unauthorized.",
      reason: "Session Required.",
    });
  }

  if (
    !getRolesPermissions(req.user.roles).includes(
      permission.ADMIN_MANAGE_ACCOUNTS
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

  let users = await prisma.user.findMany({
    where: {
      id: query.target,
    },
    include: {
      deployments: query.deployments != undefined,
    },
  });

  res.json(users);
}

export default handle;
