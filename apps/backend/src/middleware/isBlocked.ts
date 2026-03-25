import { NextFunction, Request, Response } from "express";
import { ipTable } from "../main";

export default async function isBlocked(req: Request, res: Response, next: NextFunction) {
  const requestIp =
    typeof req.headers["cf-connecting-ip"] == "undefined"
      ? req.ip
      : req.headers["cf-connecting-ip"];

  const result = ipTable.table.find((ip) => {
    return ip.ip == requestIp;
  });
  if (result && result.errorCount > 10) {
    res.statusCode = 403;
    res.json({
      error: "Forbidden.",
      reason: "Pretending to be Bot Net.",
    });
    return;
  }

  next();
}
