import { Response } from "express";
import { redis } from "../utils/redis";
import usermodel from "../models/user.model";



//Get user by Id


export const getUserById = async (id: string, res: Response): Promise<void> => {
    const userjson= await redis.get(id);
    if(userjson){
        const user=JSON.parse(userjson);
        res.status(200).json({
            status: "success",
            user,
        });
    }
  };


//Get All Users ---Only for Admin
export const getAllUsersService =async(res:Response)=>{
    const users = await usermodel.find().sort({createdAt:-1});

    res.status(200).json({
        sucess:true,
        users,
    });
};


//update User Role--- Only for admin
export const updateUserRoleService=async(res:Response,id:string,role:string)=>{
    const user=await usermodel.findByIdAndUpdate(id,{role},{new:true});

    res.status(200).json({
        success:true,
        user,
    });
};

