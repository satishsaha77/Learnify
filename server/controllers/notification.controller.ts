import notificationModel from "../models/notification.model";
import { NextFunction,Request,Response } from "express";
import { catchAsyncerror } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorhandler";
import cron from 'node-cron';


//get all Notification ---only for Admin
export const getNotification=catchAsyncerror(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const notifications=await notificationModel.find().sort({createdAt:-1});
        res.status(200).json({
            success:true,
            notifications,
        });
    } catch (error:any) {
        next(new ErrorHandler(error.message,400));
    }
});

//update Notification status ---only for Admin
export const updateNotification=catchAsyncerror(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const notification=await notificationModel.findById(req.params.id);


        if(!notification){
            return next(new ErrorHandler('Notification not found',404));
        }else{
            notification.status? notification.status='read':notification;
        }

        await notification.save();

        const notifications =await notificationModel.find().sort({createdAt:-1});

        res.status(201).json({
            success:true,
            notifications,
        });



    } catch (error:any) {
        next(new ErrorHandler(error.message,400));
    }
});

//Delete Notification
cron.schedule("0 0 0 * * *",async()=>{
    const thirtyDaysAgo=new Date(Date.now()- 30*24*60*60*1000);
    await notificationModel.deleteMany({status:"read",createdAt:{$lt:thirtyDaysAgo}});
    console.log("Deleted Read Notification");
});

