import { Request, Response, NextFunction, json } from "express";
import { catchAsyncerror } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorhandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../sevices/course.service";
import courseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/send.mails";
import notificationModel from "../models/notification.model";
import axios from "axios";


// Upload Course
export const uploadCourse = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        createCourse(data, res, next);
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});


//Edit Courses
export const editCourse = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = await courseModel.findById(courseId) as any;

        if (thumbnail && !thumbnail.startsWith("https")) {
            await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        if (thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            }
        }

        const course = await courseModel.findByIdAndUpdate(courseId, {
            $set: data
        },
            {
                new: true
            });

        res.status(201).json({
            success: true,
            course,
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

//Get single course --Without purchasing
export const getSingleCourse = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId);

        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        } else {

            const course = await courseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            await redis.set(courseId, JSON.stringify(course), "EX", 604800); //7 days
            res.status(200).json({
                success: true,
                course,
            });
        }
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});


//Get all Courses Without purchase
export const getAllCourses = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {

        // const isCacheExist = await redis.get("allCourses");
        // if (isCacheExist) {
        //     const courses = JSON.parse(isCacheExist);
        //     res.status(200).json({
        //         success: true,
        //         courses,
        //     });
        // }
        // else {
        const courses = await courseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

        // await redis.set("allCourses", JSON.stringify(courses));
        res.status(200).json({
            success: true,
            courses,
        });
        // }
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});



//get Course content --- Only for valid users
export const getCourseByUser = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExists = userCourseList?.find((course: any) => course._id.toString() == courseId);
        if (!courseExists) {
            return next(new ErrorHandler("You are not Eligible to Access this course", 404));
        }

        const course = await courseModel.findById(courseId);

        const content = course?.courseData;

        res.status(200).json({
            success: true,
            content,
        });

    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});


// Add question in Course
interface AddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}


export const addQuestion = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: AddQuestionData = req.body;

        const course = await courseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid Content Id", 400));
        }

        const courseContent = course?.courseData.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new ErrorHandler("Invalid Content Id", 400));
        }

        //Create new Question Object
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        };


        //Add this Question to our course content 
        courseContent.questions.push(newQuestion);

        await notificationModel.create({
            userId: req.user?._id,
            title: "New Question Recieved",
            message: `You have a new Question in ${courseContent.title}`,
        });

        // Save the updated Course
        await course?.save();



        res.status(200).json({
            success: true,
            course,
        });

    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});



//Add Answer in course Question
interface addAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}


export const addAnswer = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId }: addAnswerData = req.body;

        const course = await courseModel.findById(courseId);
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid Content Id", 400));
        }

        const courseContent = course?.courseData.find((item: any) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler("Invalid Content Id", 400));
        }

        const question = courseContent.questions.find((item: any) => item._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler("Invalid Question Id", 400));
        }

        // Create a new Answer object
        const newAnswer: any = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Add this Answer to our course content 
        question.questionReplies.push(newAnswer);
        await course?.save();

        // Check if the answer is to the user's own question
        if (req.user?._id === question.user._id) {
            // Create user Notification

            await notificationModel.create({
                userId: req.user?._id,
                title: "New Question Reply Recieved",
                message: `You have a new Question reply in ${courseContent.title}`,
            });

        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title, // Ensure it's `title` and not `tittle`
            };

            // Render the template file to HTML
            const html = await ejs.renderFile(path.join(__dirname, '../mails/question-reply.ejs'), data);
            try {
                // Send the email with the rendered HTML
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply",
                    data, // Pass the rendered HTML
                });

                console.log("Email sent successfully");

            } catch (error: any) {
                console.error("Email sending error:", error);
                return next(new ErrorHandler("Failed to send email", 400));
            }
        }

        res.status(200).json({
            success: true,
            course,
        });

    } catch (error: any) {
        console.error("Error in addAnswer:", error);
        next(new ErrorHandler(error.message, 400));
    }
});



//Add review in course
interface AddReviewData {
    review: string;
    rating: number;
    userId: string;
}


export const addReview = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;

        const courseId = req.params.id;

        //check if courseId already exists in the course list using the _id
        const courseExists = userCourseList?.some((course: any) => course._id.toString() === courseId.toString());



        if (!courseExists) {
            return next(new ErrorHandler("You are not Eligible to access this course", 400));
        }
        const course = await courseModel.findById(courseId);

        const { review, rating } = req.body as AddReviewData;

        const reviewData: any = {
            user: req.user,
            comment: review,
            rating,
        };
        course?.reviews.push(reviewData);

        let avg = 0;
        course?.reviews.forEach((rev: any) => {
            avg += rev.rating;
        });

        if (course) {
            course.rating = avg / course.reviews.length;
        }

        await course?.save();

        await redis.set(courseId, JSON.stringify(course), "EX", 604800); //7days

        // create notification
        await notificationModel.create({
            user: req.user?._id,
            title: "New Review Recieved",
            message: `${req.user?.name} has given a review in ${course?.name}`,
        })

        res.status(200).json({
            success: true,
            course,
        });

    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});


//Add reply in review
interface AddReviewData {
    comment: string;
    courseId: string;
    reviewId: string;
}

export const addReplyReview = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, courseId, reviewId } = req.body as AddReviewData;
        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }

        const review = course?.reviews?.find((rev: any) => rev._id.toString() === reviewId.toString());


        if (!review) {
            return next(new ErrorHandler('Review not found', 404));
        }

        const replyData: any = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (!review.commentReplies) {
            review.commentReplies = [];
        }


        review.commentReplies?.push(replyData);

        await course.save();

        await redis.set(courseId, JSON.stringify(course), "EX", 604800); //7days

        res.status(200).json({
            success: true,
            course,
        });

    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});


//Get All Courses ---Only for Admin
export const getAllCoursesAdmin = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllCoursesService(res);
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});

// generate video url
export const generateVideoUrl = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { videoId } = req.body;
        const response = await axios.post(
            `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
            { ttl: 300 },
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
                },
            }
        );

        res.json(response.data);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
