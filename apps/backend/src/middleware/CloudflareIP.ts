import { NextFunction, Request, Response } from "express";
import { Mutable } from "../types/Mutable";

export default async function isBlocked(req: Request, res: Response, next: NextFunction) {
  const requestIp =
    typeof req.headers["cf-connecting-ip"] == "undefined"
      ? req.ip
      : req.headers["cf-connecting-ip"];

  req.realIp = requestIp+'';

  next();
}
