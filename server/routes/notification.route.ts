import Express from "express";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { getNotification, updateNotification } from "../controllers/notification.controller";
import { updateAccessToken } from "../controllers/user.controller";

const notificationRouter = Express.Router();

notificationRouter.get('/get-allNotifications', updateAccessToken, isAuthenticated, authorizeRole("admin"), getNotification);
notificationRouter.put('/update-notification/:id', updateAccessToken, isAuthenticated, authorizeRole("admin"), updateNotification);


export default notificationRouter;
