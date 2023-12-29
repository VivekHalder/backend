import { Router } from "express";

//we can import in this way if the function is not exported by default.
import { registerUser } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'

const router = Router();

//https:localhost:PORT/api/v1/users/register

//.post() accepts a callback function
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);


export default router;