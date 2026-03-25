import { writeFileSync, mkdirSync, existsSync } from "fs";
import { Worker } from "../cache/worker";
import apply from "../kubectl/apply";
import { IngressRule, TLSRule } from "../types/Ingress";

export default async function updateIngress(
  worker: Worker,
  id: string,
  ingressRules: IngressRule[],
  tlsRules: TLSRule[]
) {
  if (!existsSync("./temp")) mkdirSync(`./temp`);

  if (!existsSync(`./temp/${id}`)) mkdirSync(`./temp/${id}`);

  writeFileSync(
    `temp/${id}/ingress.json`,
    JSON.stringify({
      kind: "Ingress",
      apiVersion: "networking.k8s.io/v1",
      metadata: {
        name: id,
        namespace: process.env.K3S_NAMESPACE,
        labels: {
          app: id,
        },
      },
      spec: {
        ingressClassName: "traefik",
        rules: [
          {
            host: `${id}.${process.env.HOST}`,
            http: {
              paths: [
                {
                  path: "/",
                  pathType: "Prefix",
                  backend: {
                    service: {
                      name: id,
                      port: {
                        number: 80,
                      },
                    },
                  },
                },
              ],
            },
          },
          ...ingressRules,
        ],
      },
      status: {
        loadBalancer: {},
      },
    })
  );

  await apply(worker, `temp/${id}/ingress.json`);
}
