import { Router } from "express";

//we can import in this way if the function is not exported by default.
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

//https:localhost:PORT/api/v1/users/register

//.post accepts a callback function
router.route("/register").post(registerUser);


export default router;