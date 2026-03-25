import { Request, Response } from "express";
import prisma from "../../prisma";
import { getRolesPermissions } from "../../perm";
import { permission } from "../../perm/perms";
import deleteDeployment from "../../scripts/deleteDeployment";
import { cache } from "../../cache";

async function handle(req: Request, res: Response) {
  const body: { deploymentId: string } = await req.body;

  if (!body.deploymentId || typeof body.deploymentId != "string") {
    res.statusCode = 400;
    res.json({
      error: "Target Deployment ID is not defined.",
      reason: `Target Deployment ID is required in "deploymentId" as string.`,
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

  let existing = await prisma.deployment.findFirst({
    where: {
      id: body.deploymentId,
      ownerId: req.user.id,
    },
  });

  if (!existing) {
    res.statusCode = 400;
    return res.json({
      error: "Deployment is not existing.",
      reason: "Given deployment is not existing in the database.",
    });
  }

  const worker = cache.createWorker(
    "krenear.admin.deploymentDelete",
    req.user.id,
    null
  );

  deleteDeployment(worker, body.deploymentId).then(async () => {
    await prisma.record.deleteMany({
      where: {
        deploymentId: body.deploymentId,
      },
    });

    await prisma.worker.deleteMany({
      where: {
        deploymentId: body.deploymentId,
      },
    });

    await prisma.deployment.delete({
      where: {
        id: body.deploymentId,
        ownerId: req.user!.id,
      },
      include: {
        records: true,
        workers: true,
      },
    });

    worker.stop();
  });

  res.statusCode = 200;
  res.json({ workerId: worker.id });
}

export default handle;
