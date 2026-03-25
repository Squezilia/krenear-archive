import { Router } from "express";

import CreateHandler from "./create";
import GetHandler from "./get";
import DeleteHandler from "./delete";

import RecordHandler from "./record/record";
import RecordGetHandler from "./record/recordGet";
import RecordDeleteHandler from "./record/recordDelete";

import DomainAddHandler from "./domain/add";
import DomainRemoveHandler from "./domain/remove";

import isAuthenticated from "../../middleware/isAuthenticated";

const DeploymentRouter = Router();

DeploymentRouter.post("/create", isAuthenticated, CreateHandler);
DeploymentRouter.get("/get", isAuthenticated, GetHandler);
DeploymentRouter.delete("/delete", isAuthenticated, DeleteHandler);

DeploymentRouter.post("/record", isAuthenticated, RecordHandler);
DeploymentRouter.get("/record/get", isAuthenticated, RecordGetHandler);
DeploymentRouter.delete("/record/delete", isAuthenticated, RecordDeleteHandler);

DeploymentRouter.post("/domain/add", isAuthenticated, DomainAddHandler);
DeploymentRouter.delete("/domain/remove", isAuthenticated, DomainRemoveHandler);

export default DeploymentRouter;
