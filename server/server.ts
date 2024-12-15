import { app } from "./app";
import { initSocketServer } from "./socketServer";
import connectDb from "./utils/db";
import {v2 as cloudinary} from "cloudinary";
import http from "http";
require("dotenv").config();
const server = http.createServer(app);

//cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});

initSocketServer(server);

//create our server
server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDb();
});