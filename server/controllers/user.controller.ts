require('dotenv').config();
import { Request, Response, NextFunction } from "express";
import usermodel, { Iuser } from "../models/user.model";
import errorHandler from "../utils/errorhandler";
import { catchAsyncerror } from "../middleware/catchAsyncError";
import Jwt, { JwtPayload, Secret } from "jsonwebtoken";
import sendMail from "../utils/send.mails";
import { accessTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getAllUsersService, getUserById, updateUserRoleService } from "../sevices/user.service";
import cloudinary from "cloudinary";
import ErrorHandler from "../utils/errorhandler";
import courseModel from "../models/course.model";
// Register User Interface
interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

// Interface for Activation Token
interface IActivationToken {
    token: string;
    activationCode: string;
}

// Register User Function
export const registrationUser = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    // Check if email already exists
    const isEmailExist = await usermodel.findOne({ email });
    if (isEmailExist) {
        return next(new errorHandler("Email already exists", 400));
    }

    // Create user data
    const user: IRegistrationBody = { name, email, password };

    // Generate activation token and code
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;

    // Data to be passed to the template
    const data = { user: { name: user.name }, activationCode };

    // Send activation email
    try {
        await sendMail({
            email: user.email,
            subject: "Activate Your Account",
            template: "activation-mail", // Ensure template path matches
            data,
        });

        res.status(201).json({
            success: true,
            message: `Please check your email: ${user.email} to activate your account`,
            activationToken: activationToken.token,
        });
    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});

// Function to Create Activation Token
export const createActivationToken = (user: IRegistrationBody): IActivationToken => {
    // Generate a 4-digit activation code
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Sign a JWT with the user data and activation code
    const token = Jwt.sign(
        { user, activationCode },
        process.env.ACTIVATION_SECRET as Secret, // Ensure this environment variable is set
        { expiresIn: "5m" }
    );

    return { token, activationCode };
};




//Activation user 
interface activationUser {
    activation_token: string;
    activation_code: string;
}

export const activateUser = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body as activationUser;
        const newUser: { user: Iuser; activationCode: string } = Jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: Iuser; activationCode: string };

        if (newUser.activationCode != activation_code) {
            return next(new errorHandler("Invalid Activation code", 400));
        }
        const { name, email, password } = newUser.user;

        const existUser = await usermodel.findOne({ email });
        if (existUser) {
            return next(new errorHandler("Email already exist", 400));
        }

        const user = await usermodel.create({
            name,
            email,
            password,
        });
        res.status(201).json({
            success: true,
        });


    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});


// Login User
interface loginRequest {
    email: string;
    password: string;
}

export const LoginUser = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as loginRequest;
        if (!email || !password) {
            return next(new errorHandler("Please enter Email and Password", 400));
        };
        const user = await usermodel.findOne({ email }).select("+password");
        if (!user) {
            return next(new errorHandler("Invalid Email or Password", 400));
        };
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new errorHandler("Invalid Email or Password", 400));
        };
        sendToken(user, 200, res)

    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});


//LogOut user

export const LogoutUser = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });

        const Userid = req.user && req.user._id ? req.user._id.toString() : "";
        redis.del(Userid);

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});

//Update Access token

export const updateAccessToken = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = Jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
        const message = "Could not Refresh token";
        if (!decoded) {
            return next(new errorHandler(message, 400));
        }

        const Session = await redis.get(decoded.id as string);
        if (!Session) {
            return next(new errorHandler("Please login to access this resources", 400));
        }

        const user = JSON.parse(Session);


        const accessToken = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: "5m",
        });

        const refreshToken = Jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: "3d",
        });

        req.user = user;

        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, accessTokenOptions);

        await redis.set(user._id, JSON.stringify(user), "EX", 604800); //7 days 604800
        // res.status(200).json({
        //     status: true,
        //     accessToken,
        // })
        next();
    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});



//Get User Information

export const getUserInfo = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user && req.user._id ? req.user?._id.toString() : "";
        getUserById(userId, res);
    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});




//Social Auth


interface socialAuthBody {
    email: string;
    name: string;
    avatar?: string;
}



export const socialAuth = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, avatar } = req.body as socialAuthBody;
        const user = await usermodel.findOne({ email });
        if (!user) {
            const newUser = await usermodel.create({ email, name, avatar });
            sendToken(newUser, 200, res);
        }
        else {
            sendToken(user, 200, res);
        }
    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});



//Update User Information

interface updateUserInfo {
    name?: string;
    email?: string;
}

export const updateUserInfo = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body as updateUserInfo;
        const userId = req.user && req.user._id ? req.user?._id.toString() : "";
        const user = await usermodel.findById(userId);

        if (name && user) {
            user.name = name;
        }
        await user?.save();
        await redis.set(userId, JSON.stringify(user));
        res.status(200).json({
            success: true,
            user,
        });


    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});


//update Password 
interface updatePassword {
    oldPassword: string;
    newPassword: string;
}

export const updatePassword = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword, newPassword } = req.body as updatePassword;

        if (!oldPassword || !newPassword) {
            return next(new errorHandler("Please provide both old and new password", 400));
        }
        const user = await usermodel.findById(req.user?._id).select('+password');

        if (user?.password === undefined) {
            return next(new errorHandler("Invalid User", 400));
        }

        const isPasswordMatch = await user?.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new errorHandler("Invalid Old Password", 400));
        }

        user.password = newPassword;
        await user?.save();
        const Userid = req.user && req.user._id ? req.user._id.toString() : "";
        await redis.set(Userid, JSON.stringify(user));

        res.status(200).json({
            success: true,
            user,
        });


    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});


//Update profile Image

interface updateAvatar {
    avatar: string;
}

export const updateAvatar = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { avatar } = req.body;
        const Userid = req.user && req.user._id ? req.user._id.toString() : "";
        const user = await usermodel.findById(Userid);
        if (avatar && user) {
            if (user?.avatar.public_id) {
                //first destroy the Avatar
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

                //Now update the Avatar
                const mycloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });
                user.avatar = {
                    public_id: mycloud.public_id,
                    url: mycloud.secure_url
                }

            } else {
                const mycloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });
                user.avatar = {
                    public_id: mycloud.public_id,
                    url: mycloud.secure_url
                }
            }
        }

        await user?.save();
        await redis.set(Userid, JSON.stringify(user));

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error: any) {
        next(new errorHandler(error.message, 400));
    }
});



//Get All Users --- Only for Admin
export const getAllUsers = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllUsersService(res);
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});


//update User Role ----Only for Admin
export const updateUserRole = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, role } = req.body;
        updateUserRoleService(res, id, role);
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});


//Delete User--- Only for Admin
export const deleteUser = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await usermodel.findById(id);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        await user.deleteOne({ id });

        await redis.del(id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });

    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});



//Delete Courses--- Only for Admin
export const deleteCourse = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await courseModel.findById(id);
        if (!course) {
            return next(new ErrorHandler('User not found', 404));
        }

        await course.deleteOne({ id });

        await redis.del(id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully',
        });

    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});
