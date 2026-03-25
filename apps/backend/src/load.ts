import "dotenv/config";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import "./cache";
import cuid from "./cuid";
import prisma from "./prisma";
import { cache } from "./cache";
import { IngressRule, TLSRule } from "./types/Ingress";
import updateIngress from "./scripts/updateIngress";
import updateConfigmap from "./scripts/updateConfigmap";

const argv: any = yargs(hideBin(process.argv)).argv;

if (argv.dev) {
  process.env.ENVIRONMENT = "development";
  console.log("😈 Server is running on development mode.");
  process.env.JWT_ACCESS_SECRET = "krenear";
  console.log("❗ JWT_ACCESS_SECRET is set to default.");
  hostServer();
} else if (argv.test) {
  process.env.ENVIRONMENT = "test";
  process.env.PORT = "95655";
  console.log("🤓 Server is running on testing mode.");
  process.env.JWT_ACCESS_SECRET = cuid();
  hostServer();
} else if (argv.updateConfigs) {
  process.env.ENVIRONMENT = "update";
  process.env.PORT = "95655";
  console.log(`🤓 Updating Configs. HOST=${process.env.HOST}`);
  process.env.JWT_ACCESS_SECRET = cuid();

  prisma.deployment.findMany().then(async (deployments) => {
    const worker = cache.createWorker("krenear.updateIngress", null, null);

    for (let deployment of deployments) {
      const ingressRules: IngressRule[] = [];
      const tlsRules: TLSRule[] = [];

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

      // await deleteConfigmap(deployment.id, worker);

      await updateConfigmap(worker, deployment.id).then(async () => {
        if (worker.status == "error") {
          console.log(worker.logs[0]);
          worker.logs.push(
            `LOG ${new Date().toTimeString()} Reverting changes.`
          );
          return;
        }
      });

      await updateIngress(worker, deployment.id, ingressRules, tlsRules).then(
        async () => {
          if (worker.status == "error") {
            worker.logs.push(
              `LOG ${new Date().toTimeString()} Reverting changes.`
            );
            return;
          }

          await prisma.deployment.update({
            where: {
              id: deployment.id,
            },
            data: {
              defaultDomain: `${deployment.id}.${process.env.HOST}`,
              domains: deployment.domains,
            },
          });
        }
      );

      console.log(`✨ Updated ${deployment.id}`);
    }

    console.log(`😇 All Deployments Updated.`);

    worker.stop();
  });

  // process.exit();

  //hostServer();
} else {
  process.env.ENVIRONMENT = "production";
  console.log("😇 Server is running on production mode.");
  process.env.JWT_ACCESS_SECRET = cuid();
  hostServer();
}

if (argv.nok3s) {
  process.env.K3S = "unavailable";
  console.log("💻 k3s will not be used.");
}

function hostServer() {
  import("./main.js");
}
