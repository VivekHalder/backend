import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";


const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Mongoose  connected!!!. DB_NAME:  ${connectionInstance.connection.host}`);
    } catch( error ){
        console.log("MongoDB connection error : ", error);
        process.exit(1);
    }
};

export default connectDB;