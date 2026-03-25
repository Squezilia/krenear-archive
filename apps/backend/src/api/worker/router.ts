import { Router } from "express";

import isAuthenticated from "../../middleware/isAuthenticated";
import WorkerGet from "./get";

const WorkerRouter = Router();

WorkerRouter.get("/get", isAuthenticated, WorkerGet);

export default WorkerRouter;
