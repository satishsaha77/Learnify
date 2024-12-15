import { Response } from "express";
import courseModel from "../models/course.model";
import { catchAsyncerror } from "../middleware/catchAsyncError";



//Create Course
export const createCourse = catchAsyncerror( async (data:any, res: Response) => {
    const course=await courseModel.create(data);
    res.status(200).json({
        success:true,
        course
    });
});


//Get All Courses ---Only for Admin
export const getAllCoursesService =async(res:Response)=>{
    const courses = await courseModel.find().sort({createdAt:-1});

    res.status(200).json({
        sucess:true,
        courses,
    });
};




