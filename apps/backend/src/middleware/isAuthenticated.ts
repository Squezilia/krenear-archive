import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { User } from "@prisma/client";
import { JWTVerifyResult, jwtVerify } from "jose";
import { createSecretKey } from "crypto";

import { compare, hash } from "bcrypt";

export default async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.header("authorization")) {
    res.header("Access-Control-Allow-Origin", "*");
    res.statusCode = 401;
    return res.json({ error: "Unexpected authorization header." });
  }

  const parsedAuthorization = (req.header("authorization") || '').split(" ");

  // Make a switch for authorization methods
  switch (parsedAuthorization[0]) {
    case "Basic":
      // [0]: username, [1]: password
      const buf = Buffer.from(parsedAuthorization[1] || "", "base64url")
        .toString("utf-8")
        .split(":");

      const basicCredentials = {
        username: buf[0],
        password: buf[1],
      };

      if (buf.length != 2) {
        res.header("Access-Control-Allow-Origin", "*");
        res.statusCode = 400;
        return res.json({
          error: "Unexpected authorization header.",
          reason: "Username or password is not provided.",
        });
      }

      const basicUser = await prisma.user.findFirst({
        where: {
          username: basicCredentials.username,
        },
      });
      const basicHashComparisionResult = await compare(
        basicCredentials.password || "",
        basicUser?.password || ""
      );

      if (!basicUser) {
        res.header("Access-Control-Allow-Origin", "*");
        res.statusCode = 401;
        return res.json({
          error: "Unauthorized.",
          reason: "User doesn't exists.",
        });
      }

      if (!basicHashComparisionResult) {
        res.header("Access-Control-Allow-Origin", "*");
        res.statusCode = 401;
        return res.json({
          error: "Unauthorized.",
          reason: "Password is wrong.",
        });
      }

      if (basicUser.suspended) {
        res.header("Access-Control-Allow-Origin", "*");
        res.statusCode = 403;
        return res.json({
          error: "Forbidden.",
          reason: "Suspended account.",
        });
      }

      req.user = basicUser;
      next();
      break;

    case "Bearer":
      let bearerToken = parsedAuthorization[1] || "";

      let jwtResult: JWTVerifyResult | null = null;

      try {
        jwtResult = await jwtVerify(
          bearerToken,
          createSecretKey(process.env.JWT_ACCESS_SECRET || "krenear", "utf-8")
        );
      } catch (e: any) {
        if (!(e instanceof Error)) {
          res.header("Access-Control-Allow-Origin", "*");
          res.statusCode = 500;
          return res.json({
            error: "Internal Server Error",
            reason: "Unexpected error in server.",
          });
        }
        if ((e as any)!.code == "ERR_JWS_INVALID") {
          res.header("Access-Control-Allow-Origin", "*");
          res.statusCode = 401;
          return res.json({
            error: "Unauthorized.",
            reason: "Invalid JWT.",
          });
        }
      }

      if (!jwtResult) {
        res.header("Access-Control-Allow-Origin", "*");
        res.statusCode = 401;
        return res.json({
          error: "Unauthorized.",
          reason: "Invalid JWT.",
        });
      }

      if (!jwtResult?.payload.id) {
        res.header("Access-Control-Allow-Origin", "*");
        res.statusCode = 401;
        return res.json({
          error: "Unauthorized.",
          reason: "Invalid JWT Payload Schema.",
        });
      }

      let bearerUser = await prisma.user.findFirst({
        where: {
          id: jwtResult?.payload.id || "",
        },
      });

      if (!bearerUser) {
        res.header("Access-Control-Allow-Origin", "*");
        res.statusCode = 401;
        return res.json({
          error: "Unauthorized",
          reason: "User doesn't exists.",
        });
      }

      if (bearerUser.suspended) {
        res.header("Access-Control-Allow-Origin", "*");
        res.statusCode = 403;
        return res.json({
          error: "Forbidden.",
          reason: "Suspended account.",
        });
      }

      req.user = bearerUser;
      next();
      return;

    default:
      res.header("Access-Control-Allow-Origin", "*");
      res.statusCode = 400;
      res.json({
        error: "Unexpected authorization header.",
        reason: "Unknown authorization method.",
      });
      next();
      break;
  }
}
