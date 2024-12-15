import { error } from 'console';
import Redis from 'ioredis';
require('dotenv').config();

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log("Redis is connected");
        return process.env.REDIS_URL;
    }
    throw  error("redis connection failed");
};

export const redis = new Redis(redisClient());