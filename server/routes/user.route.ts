import express from 'express';
import { activateUser, deleteUser, getAllUsers, getUserInfo, LoginUser, LogoutUser, registrationUser, socialAuth, updateAccessToken, updateAvatar, updatePassword, updateUserInfo, updateUserRole } from '../controllers/user.controller';
import { authorizeRole, isAuthenticated } from '../middleware/auth';


const userRouter = express.Router();

userRouter.post('/registration', registrationUser);
userRouter.post('/activateUser', activateUser);
userRouter.post('/loginUser', LoginUser);
userRouter.get('/logOutUser', isAuthenticated, LogoutUser);
userRouter.get('/refresh', updateAccessToken);
userRouter.get('/me', updateAccessToken, isAuthenticated, getUserInfo);
userRouter.post('/socialAuth', socialAuth);
userRouter.put('/update-user-info', updateAccessToken, isAuthenticated, updateUserInfo);
userRouter.put('/update-user-Password', updateAccessToken, isAuthenticated, updatePassword);
userRouter.put('/update-user-avatar', updateAccessToken, isAuthenticated, updateAvatar);
userRouter.get('/get-users', updateAccessToken, isAuthenticated, authorizeRole("admin"), getAllUsers);
userRouter.put('/update-user-role', updateAccessToken, isAuthenticated, authorizeRole("admin"), updateUserRole);
userRouter.delete('/delete-user/:id', updateAccessToken, isAuthenticated, authorizeRole("admin"), deleteUser);


export default userRouter;