import { Router } from "express";

import LoginHandler from "./login";
import InfoHandler from "./info";

import RegisterHandler from "./register";
import isAuthenticated from "../../middleware/isAuthenticated";

const AuthRouter = Router();
AuthRouter.post("/login", LoginHandler);
AuthRouter.get("/info", isAuthenticated, InfoHandler);
AuthRouter.post("/register", RegisterHandler);

/* if (process.env.ENVIRONMENT == "development") {
}
 */
export default AuthRouter;
