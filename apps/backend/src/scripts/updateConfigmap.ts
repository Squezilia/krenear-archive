import { writeFileSync, mkdirSync, existsSync } from "fs";
import { Worker } from "../cache/worker";
import apply from "../kubectl/apply";

export default async function updateConfigmap(worker: Worker, id: string) {
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

  await apply(worker, `temp/${id}/configMap.json`);
}
