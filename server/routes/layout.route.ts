import Express from "express";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller";
import { updateAccessToken } from "../controllers/user.controller";

const layoutRouter = Express.Router();


layoutRouter.post("/create-layout", updateAccessToken, isAuthenticated, authorizeRole('admin'), createLayout);

layoutRouter.put("/edit-layout", updateAccessToken, isAuthenticated, authorizeRole('admin'), editLayout);

layoutRouter.get("/get-layout/:type", isAuthenticated, authorizeRole('admin'), getLayoutByType);

export default layoutRouter;

