import { writeFileSync, mkdirSync, existsSync } from "fs";
import { Worker } from "../cache/worker";
import Config from "../types/Config";
import apply from "../kubectl/apply";

export default async function createDeployment(
  worker: Worker,
  id: string,
  config: Config
) {
  if (!existsSync("./temp")) mkdirSync(`./temp`);

  if (!existsSync(`./temp/${id}`)) mkdirSync(`./temp/${id}`);

  writeFileSync(
    `temp/${id}/configMap.json`,
    JSON.stringify({
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: {
        name: id,
        namespace: process.env.K3S_NAMESPACE,
        labels: {
          app: id,
        },
      },
      data: {
        KRENEAR_KEY: JSON.stringify({
          host: `${process.env.HTTPS == "true" ? "https://" : "http://"}${
            process.env.BACKEND
          }`,
          deploymentId: id,
        }),
      },
    })
  );

  writeFileSync(
    `temp/${id}/deployment.json`,
    JSON.stringify({
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: id,
        namespace: process.env.K3S_NAMESPACE,
        labels: {
          app: id,
        },
      },
      spec: {
        selector: {
          matchLabels: {
            app: id,
          },
        },
        template: {
          metadata: {
            labels: {
              app: id,
            },
          },
          spec: {
            imagePullSecrets: [
              {
                name: "regcred",
              },
            ],
            containers: [
              {
                name: config.id,
                image: `${process.env.REGISTRY}/${config.image}`,
                volumeMounts: [
                  {
                    name: id,
                    mountPath: "/usr/share/nginx/html/KRENEAR_KEY.json",
                    subPath: "KRENEAR_KEY",
                  },
                ],
              },
            ],
            volumes: [
              {
                name: id,
                configMap: {
                  name: id,
                  items: [
                    {
                      key: "KRENEAR_KEY",
                      path: "KRENEAR_KEY",
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    })
  );

  writeFileSync(
    `temp/${id}/service.json`,
    JSON.stringify({
      apiVersion: "v1",
      kind: "Service",
      metadata: {
        name: id,
        namespace: process.env.K3S_NAMESPACE,
      },
      spec: {
        selector: {
          app: id,
        },
        type: "ClusterIP",
        ports: [
          {
            targetPort: 80,
            port: 80,
          },
        ],
      },
    })
  );

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
        ],
      },
      status: {
        loadBalancer: {},
      },
    })
  );

  await apply(worker, `temp/${id}/configMap.json`);
  await apply(worker, `temp/${id}/deployment.json`);
  await apply(worker, `temp/${id}/service.json`);
  await apply(worker, `temp/${id}/ingress.json`);
}
