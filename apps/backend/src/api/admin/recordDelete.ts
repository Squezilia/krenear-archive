import { Request, Response } from "express";
import prisma from "../../prisma";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

async function handle(req: Request, res: Response) {
  const body = await req.body;

  let bulkDelete = false;
  let recordsThatDoesntExists = [];

  if (
    body.recordId &&
    typeof body.recordId == "object" &&
    Array.isArray(body.recordId)
  ) {
    bulkDelete = true;
  } else if (body.recordId && typeof body.recordId == "string") {
    bulkDelete = false;
  } else {
    res.statusCode = 400;
    return res.json({
      error: "Target Record ID is not defined.",
      reason: `Target Record ID is required in "recordId" as string or string array.`,
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
      permission.ADMIN_MANAGE_RECORDS
    )
  ) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Insufficient Authorization.",
    });
  }

  if (bulkDelete) {
    for (let recordId of body.recordId) {
      try {
        await prisma.record.delete({
          where: {
            id: recordId,
          },
        });
      } catch (e) {
        if (e && (e as PrismaClientKnownRequestError).code == "P2025") {
          recordsThatDoesntExists.push(recordId);
        } else {
          // TODO: Sent this error to logger
          console.error(e);
          res.statusCode = 500;
          return res.json({
            error: "Internal Server Error.",
            reason: "Prisma ORM Error. Details are writed into the logs.",
          });
        }
      }
    }

    res.statusCode = 200;
    return res.json({
      message:
        recordsThatDoesntExists.length > 0
          ? "Record deleted with errors."
          : "Records deleted.",
      error:
        recordsThatDoesntExists.length > 0
          ? recordsThatDoesntExists
          : undefined,
    });
  } else {
    let existing = await prisma.record.findFirst({
      where: {
        id: body.recordId,
      },
    });

    if (!existing) {
      res.statusCode = 400;
      return res.json({
        error: "Record is not existing.",
        reason: "Given record is not existing in the database.",
      });
    }

    await prisma.record.delete({
      where: {
        id: body.recordId,
      },
    });

    res.statusCode = 200;
    return res.json({ message: "Record deleted." });
  }
}

export default handle;
