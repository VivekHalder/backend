//require('dotenv').config({path: './env'});

import dotenv from "dotenv";
import connectDB from "../db/index.js"

dotenv.config({
    path: "./env",
})

connectDB();


/*
import express from 'express';
const app = express();

;( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (e) => {
            console.log("ERR : ", e);
            throw e;
        });
        app.listen(process.env.PORT, () => {
            console.log(`${process.env.PORT}`);
        } )
    } catch(e){
        console.log(e);
        throw e;
    }
} ) ()
*/