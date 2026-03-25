import { Request, Response } from "express";
import { SignJWT } from "jose";
import prisma from "../../prisma";
import { createSecretKey } from "crypto";
import { addMonths } from "date-fns";
import { hash } from "bcrypt";
import validateSchema, { MapSchema } from "../../lib/validateSchema";
import { User } from "@prisma/client";

async function handle(req: Request, res: Response) {
  const body: { username: string; password: string; admin: boolean } =
    await req.body;

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

  let usernameRegex = /(-+|[a-z]+|[0-9]+)/gy;

  if (
    body.username.match(usernameRegex)?.join("").length != body.username.length
  ) {
    res.statusCode = 400;
    return res.json({
      error: "Validation Error",
      reason: "Username isn't valid.",
    });
  }

  const ipTargetUser = await prisma.user.findFirst({
    where: {
      ipAdress: req.realIp,
    },
  });

  if (ipTargetUser) {
    res.statusCode = 400;
    return res.json({
      error: "This user is existing",
      reason: `Given "username" already used in another user.`,
    });
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      username: body.username,
    },
  });

  if (targetUser) {
    res.statusCode = 400;
    return res.json({
      error: "This user is existing",
      reason: `Given "username" already used in another user.`,
    });
  }

  if (process.env.ENVIRONMENT != "development") body.admin = false;

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

  let userWithNoPassword = createdUser as Omit<User, "password"> & {
    password?: string;
  };
  let userWithNoIP = userWithNoPassword as Omit<
    typeof userWithNoPassword,
    "ipAdress"
  > & { ipAdress?: string };

  userWithNoIP.password = undefined;
  userWithNoIP.ipAdress = undefined;

  const accessToken = await new SignJWT({ id: userWithNoIP.id })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(process.env.ENVIRONMENT == "development" ? "999y" : "1d")
    .sign(createSecretKey(process.env.JWT_ACCESS_SECRET || "krenear", "utf-8"));

  res.json({ user: userWithNoIP, token: accessToken });
}

export default handle;
