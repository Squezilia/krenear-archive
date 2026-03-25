import { Request, Response } from "express";
import { SignJWT } from "jose";
import prisma from "../../prisma";
import { createSecretKey } from "crypto";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";
import { addMonths } from "date-fns";
import { hash } from "bcrypt";

async function handle(req: Request, res: Response) {
  const body: { username: string; password: string; admin: boolean } =
    await req.body;

  if (!body.username || typeof body.username != "string") {
    res.statusCode = 400;
    return res.json({
      error: "Username is not defined.",
      reason: `Username is required in "username" as string.`,
    });
  }
  if (!body.password || typeof body.password != "string") {
    res.statusCode = 400;
    return res.json({
      error: "Password is not defined!",
      reason: `Password is required in "password" as string.`,
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

  const existingUser = await prisma.user.findFirst({
    where: {
      username: body.username,
    },
  });

  if (existingUser) {
    res.statusCode = 400;
    return res.json({
      error: "This user is existing",
      reason: `Given "username" already used in another user.`,
    });
  }

  const bcryptHashedPassword = await hash(body.password, 10);

  let subscriptionEndDate = new Date();

  subscriptionEndDate = addMonths(subscriptionEndDate, 1);

  const createdUser = await prisma.user.create({
    data: {
      username: body.username,
      password: bcryptHashedPassword,
      roles: body.admin ? ["admin", "default"] : ["default"],
      subscription: ["default"],
      subscriptionEndDate,
      ipAdress: req.realIp,
    },
  });

  const accessToken = await new SignJWT({ id: createdUser.id })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(createSecretKey(process.env.JWT_ACCESS_SECRET || "krenear", "utf-8"));

  res.json({ user: createdUser, token: accessToken });
}

export default handle;
