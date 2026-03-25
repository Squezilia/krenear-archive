import { Request, Response } from "express";
import prisma from "../../prisma";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";
import getConfig from "../../configs";
import { cache } from "../../cache";
import cuid from "../../cuid";
import createDeployment from "../../scripts/createDeployment";
import subscriptions from "../../subscriptions";
import generateName from "../../lib/createName";
import validateSchema, { MapSchema } from "../../lib/validateSchema";

async function handle(req: Request, res: Response) {
  const body: { name: string; configuration: string } = await req.body;

  if (!body.name) body.name = generateName();

  const schema = {
    name: "string",
    configuration: "string",
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
    !getRolesPermissions(req.user.roles).includes(permission.USER_MANAGE_DEPLOYMENTS)
  ) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Insufficient Authorization.",
    });
  }

  let userSubscriptions = subscriptions.filter((sub) =>
    req.user?.subscription.includes(sub.id)
  );
  let userSubscriptionsLimits: number[] = [];

  for (let sub of userSubscriptions) {
    userSubscriptionsLimits.push(sub.limits.deployment);
  }

  const maxDeploymentsSize = Math.max(...userSubscriptionsLimits);

  const userDeploymentsSize = (
    await prisma.deployment.findMany({
      where: {
        ownerId: req.user.id,
      },
    })
  ).length;

  if (userDeploymentsSize + 1 > maxDeploymentsSize) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "You've reached the limits of your subscription.",
    });
  }

  const configuration = getConfig(body.configuration);

  if (!configuration) {
    res.statusCode = 400;
    return res.json({
      error: "Configuration not found.",
      reason: "Given configuration name not found in the registry.",
    });
  }

  if (!req.user.subscription.includes(configuration.subscription.id)) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "User's subscription doesn't include this configuration.",
    });
  }

  const deploymentId = cuid();

  const worker = cache.createWorker("krenear.createDeployment", req.user.id, deploymentId);

  createDeployment(worker, deploymentId, configuration).then(async () => {
    if (worker.status == "error") {
      worker.logs.push(`LOG ${new Date().toTimeString()} Reverting changes.`);
      worker.deploymentId = null;
      return worker.stop();
    }

    await prisma.deployment.create({
      data: {
        // Meta
        id: deploymentId,
        name: body.name,
        defaultDomain: `${deploymentId}.${process.env.HOST}`,
        domains: [],

        // Relational
        ownerId: req.user?.id || "",

        // Configuration Meta
        configuration: configuration.id,
        version: configuration.version,

        // Configuration
        labels: configuration.labels,
      },
    });

    configuration.schemas.forEach(async (schema) => {
      let schemaTypes: string[] = [];
      let keyRegex = /[a-zA-Z]+/gs;

      const entries = Object.entries(schema.types);

      for (let [key, value] of entries) {
        if (!["string", "number", "boolean"].includes(value)) return;
        let purifiedKey = key.match(keyRegex);
        schemaTypes.push(`${purifiedKey}:${value}`);
      }

      await prisma.schema.create({
        data: {
          icon: schema.icon || "solar:key-minimalistic-bold",
          name: schema.name,
          types: schemaTypes,
          deploymentId: deploymentId,
        },
      });
    });

    worker.stop();
  });

  res.statusCode = 201;
  res.json({ workerId: worker.id });
}

export default handle;
