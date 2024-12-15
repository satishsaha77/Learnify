import { NextFunction,Response} from "express";
import { catchAsyncerror } from "../middleware/catchAsyncError";
import orderModel from "../models/order.model";


//create a new Order
export const newOrder=catchAsyncerror(async(data:any,next:NextFunction,res:Response)=>{
    const order=await orderModel.create(data);
    res.status(200).json({
        success:true,
        order,
    });
});


//Get All Orders ---Only for admin
export const getAllOrdersService =async(res:Response)=>{
    const orders = await orderModel.find().sort({createdAt:-1});

    res.status(200).json({
        sucess:true,
        orders,
    });
};