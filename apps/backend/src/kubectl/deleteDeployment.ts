import { spawn } from "child_process";
import { Worker } from "../cache/worker";

export default async function deleteDeployment(id: string, worker: Worker) {
  return new Promise((resolve, reject) => {
    if (process.env.K3S == "unavailable") return resolve(true);

    const childProcess = spawn(`k3s`, [
      "kubectl",
      "delete",
      "deployment",
      id,
      `--namespace=${process.env.K3S_NAMESPACE}`,
    ]);

    childProcess.stdout?.setEncoding("utf-8");
    childProcess.stdout?.on("data", (chunk) => {
      worker.push(
        `LOG ${new Date().toTimeString()} ${chunk}`,
        "kubectl.deleteDeployment"
      );
    });
    childProcess.stderr?.setEncoding("utf-8");
    childProcess.stderr?.on("data", (chunk) => {
      worker.push(
        `ERROR ${new Date().toTimeString()} ${chunk}`,
        "kubectl.deleteDeployment"
      );
    });

    childProcess.on("exit", (code) => {
      if (code && code > 0) {
        //exit with error
        worker.status = "error";
        worker.push(
          `ERROR ${new Date().toTimeString()} Process ended with errors, rollbacking changes.`,
          "kubectl.deleteDeployment"
        );
        return resolve(false);
      }
      worker.push(
        `LOG ${new Date().toTimeString()} Process ended successfully.`,
        "kubectl.deleteDeployment"
      );
      return resolve(true);
    });
  });
}
