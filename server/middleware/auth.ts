import { Request, Response, NextFunction } from "express";
import { catchAsyncerror } from "./catchAsyncError";
import ErrorHandler from "../utils/errorhandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";



//Authenticated User

export const isAuthenticated = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        return next(new ErrorHandler("Please login to access the resource", 400));
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;
    if (!decoded) {
        return next(new ErrorHandler("Access token is not valid", 400));
    }

    const user = await redis.get(decoded.id);
    if (!user) {
        return next(new ErrorHandler("Please Login to access this Resource", 400));
    }
    req.user = JSON.parse(user);

    next();

});



//Validate user Role

export const authorizeRole = (...roles: String[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler("You do not have permission to perform this action", 400));
        }
        next();
    }

}