import { Request, Response } from "express";
import { SignJWT } from "jose";
import prisma from "../../prisma";
import { createSecretKey } from "crypto";
import { User } from "@prisma/client";
import { compare } from "bcrypt";
import { addDays } from "date-fns";

import validateSchema, { MapSchema } from "../../lib/validateSchema";

async function handle(req: Request, res: Response) {
  const body = await req.body;

  const schema = {
    username: "string",
    password: "string",
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

  const targetUser: User | null = await prisma.user.findFirst({
    where: {
      username: body.username,
    },
  });

  const hashComparisionResult = await compare(
    body.password,
    targetUser?.password || ""
  );

  if (!targetUser) {
    res.statusCode = 400;
    return res.json({
      error: "User couldn't be find.",
      reason: "Given target user doesn't exists in the database.",
    });
  }

  // Failed Login Attempt
  if (!hashComparisionResult) {
    let suspend = false;
    if (targetUser.loginAttempts > 5) suspend = true;

    if (addDays(targetUser.lastLoginAttempt, 1) > new Date()) {
      prisma.user.update({
        where: {
          id: targetUser.id,
        },
        data: {
          lastLoginAttempt: new Date(),
          loginAttempts: targetUser.loginAttempts + 1,
          suspended: suspend,
        },
      });
    } else {
      prisma.user.update({
        where: {
          id: targetUser.id,
        },
        data: {
          lastLoginAttempt: new Date(),
          loginAttempts: 1,
        },
      });
    }

    res.statusCode = 400;
    return res.json({
      error: "Password is wrong.",
      reason: "Given password doesn't match with the user's password.",
    });
  }

  if (targetUser?.suspended) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Account Suspended.",
    });
  }

  if (Date.now() > targetUser.subscriptionEndDate.getTime()) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Subscription Ended.",
    });
  }

  if (targetUser.loginAttempts > 5) {
    res.statusCode = 429;
    return res.json({
      error: "Too Many Requests",
      reason: "Too Many Login Attempts Made.",
    });
  }

  prisma.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      lastLoginAttempt: new Date(),
      loginAttempts: 0,
    },
  });

  let userWithNoPassword = targetUser as Omit<User, "password"> & {
    password?: string;
  };
  let userWithNoIP = userWithNoPassword as Omit<
    typeof userWithNoPassword,
    "ipAdress"
  > & { ipAdress?: string };

  userWithNoIP.password = undefined;
  userWithNoIP.ipAdress = undefined;

  const accessToken = await new SignJWT({ id: userWithNoIP?.id })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(createSecretKey(process.env.JWT_ACCESS_SECRET || "krenear", "utf-8"));

  res.json({ user: userWithNoIP, token: accessToken });
}

export default handle;
