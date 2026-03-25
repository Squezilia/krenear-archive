import { Request, Response } from "express";
import prisma from "../../prisma";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";
import getConfig from "../../configs";
import { cache } from "../../cache";
import cuid from "../../cuid";
import createDeployment from "../../scripts/createDeployment";
import subscriptions from "../../subscriptions";

async function handle(req: Request, res: Response) {
  const body: { name: string; configuration: string; userId: string } =
    await req.body;

  if (!body.name || typeof body.name != "string") {
    res.statusCode = 400;
    res.json({
      error: "Deployment name is not defined.",
      reason: `Deployment name is required in "name" as string.`,
    });
    return;
  }
  if (!body.configuration || typeof body.configuration != "string") {
    res.statusCode = 400;
    res.json({
      error: "Configuration is not defined.",
      reason: `Configuration is required in "configuration" as string.`,
    });
  }
  if (!body.userId || typeof body.userId != "string") {
    res.statusCode = 400;
    res.json({
      error: "User is not defined.",
      reason: `User ID is required in "userId" as string.`,
    });
    return;
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
    !getRolesPermissions(req.user.roles).includes(permission.ADMIN_MANAGE_DEPLOYMENTS)
  ) {
    res.statusCode = 403;
    return res.json({
      error: "Forbidden.",
      reason: "Insufficient Authorization.",
    });
  }

  const maxDeploymentsSize =
    subscriptions.find((sub) => {
      return req.user?.subscription.includes(sub.name);
    })?.limits.deployment || 1;

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
      reason: "Your subscription does not include this configuration.",
    });
  }

  const deploymentId = cuid();

  const worker = cache.createWorker(
    "krenear.admin.createDeployment",
    body.userId,
    deploymentId
  );

  createDeployment(worker, deploymentId, configuration).then(async () => {
    if (worker.status == "error") {
      worker.logs.push(`LOG ${new Date().toTimeString()} Reverting changes.`);
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
        ownerId: body.userId,

        // Configuration Meta
        configuration: configuration.name,
        version: configuration.version,

        // Configuration
        labels: configuration.labels,
      },
    });

    worker.stop();
  });

  res.statusCode = 201;
  res.json({ workerId: worker.id });
}

export default handle;
