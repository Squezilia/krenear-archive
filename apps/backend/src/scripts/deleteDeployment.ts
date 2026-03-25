import { Worker } from "../cache/worker";
import deleteConfigmap from "../kubectl/deleteConfigmap";
import deleteDeploymentScript from "../kubectl/deleteDeployment";
import deleteIngress from "../kubectl/deleteIngress";
import deleteService from "../kubectl/deleteService";

export default async function deleteDeployment(worker: Worker, id: string) {
  await deleteConfigmap(id, worker);
  await deleteIngress(id, worker);
  await deleteService(id, worker);
  await deleteDeploymentScript(id, worker);
}
