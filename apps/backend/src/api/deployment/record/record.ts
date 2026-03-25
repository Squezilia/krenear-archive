import { Request, Response } from "express";
import prisma from "../../../prisma";

import { addSeconds, subHours } from "date-fns";
import validateSchema, { MapSchema } from "../../../lib/validateSchema";
import { ipTable } from "../../../main";
import { getRolesPermissions } from "../../../perm";
import { permission } from "../../../perm/perms";

async function handle(req: Request, res: Response) {
  const body: { deploymentId: string; data: Record<string, string>; schema: string } =
    await req.body;

  const schema = {
    deploymentId: "string",
    data: "object",
    schema: "string",
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
      permission.USER_MANAGE_RECORDS
    )
  ) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Insufficient Authorization.",
    });
  }  

  let deployment = await prisma.deployment.findFirst({
    where: {
      id: body.deploymentId,
    },
  });

  if (!deployment) {
    res.statusCode = 400;
    return res.json({
      error: "Target is not found.",
      reason: "Target deployment doesn't exist in the database.",
    });
  }

  const deploymentSchemas = await prisma.schema.findMany({
    where: {
      deploymentId: deployment.id,
    },
  });

  const selectedSchema = deploymentSchemas.find((schema) => {
    return schema.name == body.schema;
  });

  if (!selectedSchema) {
    res.statusCode = 400;
    return res.json({
      error: "Schema not found.",
      reason: "Given schema is not existing in the database.",
    });
  }

  let recordDatas = [];

  for (let [key, value] of Object.entries(body.data)) {
    let rowType = selectedSchema.types
      .find((type) => {
        return type.split(":")[0] == key;
      })
      ?.split(":")[1];

    if (typeof value != rowType) {
      res.statusCode = 400;
      return res.json({
        error: "Validation Error",
        reason: `Entry ${key} value is ${typeof value} but should be ${rowType}`,
      });
    }

    if (typeof value == "string" && value.length > 255) {
      res.statusCode = 400;
      return res.json({
        error: "Validation Error",
        reason: `Entry ${key} value is longer than 255 characters.`,
      });
    }

    recordDatas.push({
      rowType,
      key,
      value,
    });
  }

  let newRecord = await prisma.record.create({
    data: {
      deploymentId: deployment.id,
      schemaId: selectedSchema.id,
      data: body.data,
    },
  });

  res.json(
    process.env.ENVIRONMENT == "development"
      ? newRecord
      : { recordId: newRecord.id }
  );
}

export default handle;
