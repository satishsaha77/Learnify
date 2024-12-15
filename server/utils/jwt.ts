require('dotenv').config();
import { Response } from "express";
import { redis } from "./redis";


interface tokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

    //Parse environment variables to integrate with fallback values
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '300', 10);


//options for cookies
export const accessTokenOptions: tokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire *60*1000),
    maxAge: accessTokenExpire *60*60* 1000,
    httpOnly: true,
    sameSite: 'lax',
};
export const refreshTokenOptions: tokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire *24*60*60* 1000),
    maxAge: refreshTokenExpire *24*60*60* 1000,
    httpOnly: true,
    sameSite: 'lax',
};

export const sendToken = (user: any, statusCode: number, res: Response) => {
    const accessToken = user.SignAccesstoken();
    const refreshToken = user.SignRefreshtoken();

    //Upload Session to redis
    redis.set(user._id,JSON.stringify(user) as any);


    //only set secure to true in production
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }
    //set cookie
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
}


