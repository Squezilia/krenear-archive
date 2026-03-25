import { Request, Response } from "express";
import prisma from "../../../prisma";
import { getRolesPermissions } from "../../../perm";
import { permission } from "../../../perm/perms";
import { cache } from "../../../cache";
import updateIngress from "../../../scripts/updateIngress";
import { IngressRule, TLSRule } from "../../../types/Ingress";
import validateSchema, { MapSchema } from "../../../lib/validateSchema";

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

  if (!deployment.domains.includes(body.domain)) {
    res.statusCode = 400;
    return res.json({
      error: "Domain is not existing.",
      reason: "Given domain is not existing.",
    });
  }

  const worker = cache.createWorker(
    "krenear.removeDomain",
    req.user.id,
    deployment.id
  );

  const ingressRules: IngressRule[] = [];
  const tlsRules: TLSRule[] = [];

  deployment.domains = deployment.domains.filter((domain) => {
    return domain != body.domain;
  });

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

  res.statusCode = 200;
  res.json({ workerId: worker.id });
}

export default handle;
