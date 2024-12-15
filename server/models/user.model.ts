require('dotenv').config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt  from "jsonwebtoken";

const emailRegexPattern: RegExp = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,6}$/;

export interface Iuser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    },
    role: String;
    isVerified: boolean;
    courses: Array<{
        _id: any; courseId: string 
}>;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccesstoken:()=> string;
    SignRefreshtoken:()=> string;
};


const userSchema: Schema<Iuser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value);
            },
            message: "Please Enter valid email",
        },
        unique: true,
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 character"],
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        }
    ],
}, { timestamps: true });


//Hash Password before saving
userSchema.pre<Iuser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


//Sign Access Token
userSchema.methods.SignAccesstoken=function(){
    return jwt.sign({id:this._id},process.env.ACCESS_TOKEN || '',{expiresIn:"5m",});
};

//Sign Refresh Token
userSchema.methods.SignRefreshtoken=function(){
    return jwt.sign({id:this._id},process.env.REFRESH_TOKEN || '',{expiresIn:"3d",});
};


//Compare password method
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

const usermodel: Model<Iuser> = mongoose.model("User", userSchema);
export default usermodel;




