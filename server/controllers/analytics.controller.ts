import { Request,Response,NextFunction } from "express";
import ErrorHandler from "../utils/errorhandler";
import { catchAsyncerror } from "../middleware/catchAsyncError";
import { generate12MonthData } from "../utils/analytics.generator";
import usermodel from "../models/user.model";
import courseModel from "../models/course.model";
import orderModel from "../models/order.model";


//get User Analytics for admin only 
export const getUserAnalytics=catchAsyncerror(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const users= await generate12MonthData(usermodel);

        res.status(200).json({
            success:true,
            users,
        });
    } catch (error:any) {
        next(new  ErrorHandler(error.message,400));

    }
});


//get Courses Analytics for admin only 
export const getCoursesAnalytics=catchAsyncerror(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const courses= await generate12MonthData(courseModel);

        res.status(200).json({
            success:true,
            courses,
        });
    } catch (error:any) {
        next(new  ErrorHandler(error.message,400));

    }
});

//get Order Analytics for admin only 
export const getOrdersAnalytics=catchAsyncerror(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const orders= await generate12MonthData(orderModel);

        res.status(200).json({
            success:true,
            orders,
        });
    } catch (error:any) {
        next(new  ErrorHandler(error.message,400));

    }
});


