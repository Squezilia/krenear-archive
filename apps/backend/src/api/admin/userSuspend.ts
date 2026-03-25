import { Request, Response } from "express";
import prisma from "../../prisma";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";

async function handle(req: Request, res: Response) {
  const body: { username: string } = await req.body;

  if (!body.username || typeof body.username != "string") {
    res.statusCode = 400;
    return res.json({
      error: "Username is not defined!",
      reason: `Username is required in "username" as string.`,
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

  const targetUser = await prisma.user.findFirst({
    where: {
      username: body.username,
    },
  });

  if (!targetUser) {
    res.statusCode = 400;
    return res.json({
      error: "This user doesn't exists",
      reason: "Given target user is not existing in the database.",
    });
  }

  await prisma.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      suspended: true,
    },
  });

  res.json({
    message: "Account suspended.",
  });
}

export default handle;
