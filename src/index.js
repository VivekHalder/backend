//require('dotenv').config({path: './env'});

import dotenv from "dotenv";
import connectDB from "./db/index.js"
import {app} from '../src/app.js';

dotenv.config({
    path: "./env",
})


//an async. code also returns a promise, so we can use .then() and .catch()
connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("The app couldnot communicate with the database. Error : ", error);
        process.exit(1);
    })    
    app.listen(process.env.PORT || 2100, ()=>{
        console.log(`The server is running at port : ${process.env.PORT || 2100}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed!!! ", err);
})


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
} ) ();
*/