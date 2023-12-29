import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
//limit is the limiting size of json.
app.use(express.json({limit: "16kb"}));
//extended means objects under objects are allowed.
//limit size can be kept in constants and then imported.
app.use(express.urlencoded({extended: true, limit: "16kb"}));
//storing public assets in 'public' folder.
app.use(express.static("public"));


//cookie-parser helps in performing CRUD operations in the cookies of the browser.
//we can put SECURED cookies in the user's server.
app.use(cookieParser());



//routes import

//we can give our customized name only if we have exported it as default.
import userRouter from './routes/user.routes.js';

//routes declaration

//https://localhost:PORT/api/v1/users now the control passes to user.routes.js
app.use("/api/v1/users", userRouter);


export { app };