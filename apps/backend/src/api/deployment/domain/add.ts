import { Request, Response } from "express";
import prisma from "../../../prisma";
import { getRolesPermissions } from "../../../perm";
import { permission } from "../../../perm/perms";
import { cache } from "../../../cache";
import updateIngress from "../../../scripts/updateIngress";
import { IngressRule, TLSRule } from "../../../types/Ingress";
import validateSchema, { MapSchema } from "../../../lib/validateSchema";
import subscriptions from "../../../subscriptions";

async function handle(req: Request, res: Response) {
  const body: { domain: string; deploymentId: string } = await req.body;

  const schema = {
    domain: "string",
    deploymentId: "string",
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

  const deployment = await prisma.deployment.findFirst({
    where: {
      id: body.deploymentId,
      ownerId: req.user.id,
    },
  });

  if (!deployment) {
    res.statusCode = 400;
    return res.json({
      error: "Deployment is not existing.",
      reason: "Given deployment is not existing in the database.",
    });
  }

  if (deployment.domains.includes(body.domain)) {
    res.statusCode = 400;
    return res.json({
      error: "Domain is existing.",
      reason: "Given domain is existing.",
    });
  }

  let userSubscriptions = subscriptions.filter((sub) =>
    req.user?.subscription.includes(sub.id)
  );
  let userSubscriptionsLimits: number[] = [];

  for (let sub of userSubscriptions) {
    userSubscriptionsLimits.push(sub.limits.domains);
  }

  const maxDomainsSize = Math.max(...userSubscriptionsLimits);

  if (deployment.domains.length + 1 > maxDomainsSize) {
    res.statusCode = 400;
    return res.json({
      error: "Forbidden.",
      reason: "You've reached the limits of your subscription.",
    });
  }

  const worker = cache.createWorker("krenear.addDomain", req.user.id, deployment.id);

  const ingressRules: IngressRule[] = [];
  const tlsRules: TLSRule[] = [];

  deployment.domains.push(body.domain);

  for (let domain of deployment.domains) {
    ingressRules.push({
      host: domain,
      http: {
        paths: [
          {
            path: "/",
            pathType: "Prefix",
            backend: {
              service: {
                name: deployment.id,
                port: {
                  number: 80,
                },
              },
            },
          },
        ],
      },
    });
    tlsRules.push({
      hosts: [domain],
      secretName: `${deployment.id}-${domain.split(".").join("-")}`,
    });
  }

  deployment.domains = deployment.domains.filter((value) => {
    return value != undefined || value != null;
  });

  updateIngress(worker, deployment.id, ingressRules, tlsRules).then(async () => {
    if (worker.status == "error") {
      worker.logs.push(`LOG ${new Date().toTimeString()} Reverting changes.`);
      return worker.stop();
    }

    await prisma.deployment.update({
      where: {
        id: deployment.id,
        ownerId: req.user!.id,
      },
      data: {
        domains: deployment.domains,
      },
    });

    worker.stop();
  });

  res.statusCode = 201;
  res.json({ workerId: worker.id });
}

export default handle;
