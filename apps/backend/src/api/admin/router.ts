import { Router } from "express";

import UserCreateHandler from "./userCreate";
import UserSuspendHandler from "./userSuspend";
import UserUnsuspendHandler from "./userUnsuspend";
import UserGetHandler from "./userGet";

import DeploymentGetHandler from "./deploymentGet";
import DeploymentCreateHandler from "./deploymentCreate";
import DeploymentDeleteHandler from "./deploymentDelete";

import isAuthenticated from "../../middleware/isAuthenticated";

const AdminRouter = Router();

// /user
AdminRouter.get("/user/get", isAuthenticated, UserGetHandler);
AdminRouter.post("/user/create", isAuthenticated, UserCreateHandler);
AdminRouter.post("/user/suspend", isAuthenticated, UserSuspendHandler);
AdminRouter.post("/user/unsuspend", isAuthenticated, UserUnsuspendHandler);

// /deployment
AdminRouter.get("/deployment/get", isAuthenticated, DeploymentGetHandler);
AdminRouter.post("/deployment/create", isAuthenticated, DeploymentCreateHandler);
AdminRouter.delete("/deployment/delete", isAuthenticated, DeploymentDeleteHandler);

export default AdminRouter;
