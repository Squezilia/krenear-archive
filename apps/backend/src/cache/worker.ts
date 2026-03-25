import Query from "../lib/query";
import { WorkerStatus } from "../types/Worker";

export class Worker {
  public id: string;
  public status: WorkerStatus = "running";
  public executionHistory: Query<string> = new Query<string>();
  public userId: string | null;
  public deploymentId: string | null;
  public isRunning: boolean = true;
  public logs: Array<string> = [];

  public onStopped: () => void = () => {};

  constructor(
    id: string,
    initializeAdress: string,
    user: string | null,
    deployment: string | null
  ) {
    this.id = id;
    this.userId = user;
    this.deploymentId = deployment;

    this.executionHistory.push(initializeAdress);
  }

  push(value: string, adress: string) {
    if (this.executionHistory.getTable()[0] != adress) {
      this.executionHistory.push(adress);
    }
    this.logs.push(value);
    return this;
  }

  stop() {
    if (this.status == "running") this.status = "success";
    this.isRunning = false;
    this.onStopped();
    return this;
  }

  get() {
    return {
      id: this.id,
      status: this.status,
      executionHistory: this.executionHistory.getTable(),
      deploymentId: this.deploymentId,
      userId: this.userId,
      isRunning: this.isRunning,
      logs: this.logs,
    };
  }
}
