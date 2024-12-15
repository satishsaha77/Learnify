import mongoose from 'mongoose'
require('dotenv').config();


const dburl: string = process.env.DB_URL || '';

const connectDb = async () => {
    try {
        await mongoose.connect(dburl).then((data: any) => {
            console.log(`Database Connected with ${data.connection.host}`)
        })
    }
    catch (error: any) {
        console.log(error.message);
        setTimeout(connectDb, 5000);
    }

}


export default connectDb;

