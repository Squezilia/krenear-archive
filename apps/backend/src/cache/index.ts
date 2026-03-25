import prisma from "../prisma";
import Page from "./page";
import { Worker } from "./worker";
import cuid from "../cuid";

class Cache {
  private pages: Array<Page<unknown>> = [];
  private workers: Array<Worker> = [];

  createPage<T>() {
    const page = new Page<T>(cuid());

    this.pages.push(page);

    return page;
  }

  createWorker(
    initializeAdress: string,
    user: string | null,
    deployment: string | null
  ) {
    let worker: Worker | undefined = new Worker(
      cuid(),
      initializeAdress,
      user,
      deployment
    );

    // Delete worker after 5 hours when it completed.
    worker.onStopped = async () => {
      // Write worker to database
      await prisma.worker.create({
        data: {
          ...(worker?.get() || {
            id: worker?.id || "",
            status: worker?.status || "running",
            executionHistory: worker?.executionHistory.getTable() || [],
            deploymentId: worker?.deploymentId || undefined,
            userId: worker?.userId || "",
            logs: worker?.logs || [],
          }),
        },
      });

      // Delete worker from memory after 5 hours
      setTimeout(() => {
        let workerId = worker?.id;
        worker = undefined;
        this.workers = this.workers.filter((signedWorkers) => {
          return signedWorkers.id != workerId;
        });
      }, 3600000 * 5); //3600000ms = 1 hour
    };

    // Add to cache
    this.workers.push(worker);

    // Return pointer
    return worker;
  }

  getPage<T>(id: string) {
    return this.pages.find((page) => {
      return page.id == id;
    }) as Page<T>;
  }

  getWorker(workerId: string): Worker | null {
    return (
      this.workers.find((worker) => {
        return worker.id == workerId;
      }) || null
    );
  }
}

export var cache = new Cache();
