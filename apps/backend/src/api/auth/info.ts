import { Request, Response } from "express";

async function handle(req: Request, res: Response) {
  res.json({
    user: req.user,
    token: req.header("authorization")?.split(" ")[1],
  });
}

export default handle;
