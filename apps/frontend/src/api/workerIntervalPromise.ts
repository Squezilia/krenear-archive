import Worker from "../types/Worker";
import createProtectedApiInterface from "./protected";

const protectedApiInterface = createProtectedApiInterface();

const workerIntervalPromise = (workerId: string) =>
  new Promise((resolve: (result: Worker) => void, reject) => {
    const workerInterval = setInterval(async () => {
      const workerResponse = await protectedApiInterface({
        method: "GET",
        url: `worker/get?workerId=${workerId}`,
      });

      if (workerResponse.data.isRunning) return;

      resolve(workerResponse.data);

      clearInterval(workerInterval);
    }, 500);
  });

export default workerIntervalPromise;
