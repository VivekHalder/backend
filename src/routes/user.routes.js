import { Router } from "express";

//we can import in this way if the function is not exported by default.
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

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


router.route("/login").post( loginUser );


//secured route
router.route("/logout").post( verifyJWT, logoutUser );
router.route("/refresh-token").post( refreshAccessToken )


export default router;