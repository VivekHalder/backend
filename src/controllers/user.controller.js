import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req, res, next) => {
    //whenever an entry is made to the mongodb database, the response contains all the entries made to it.

    // (1) get user details from frontend or postman
    // (2) validation - no empty values and email
    //check if user already exists ( use email or username )
    // (3) check for images and check for avatar
    // (4) if available, upload to cloudinary
    //create user object, because mongodb is noSql so mainly objects are used. create entry in db
    // (5) remove password and refresh token field from response
    // (6) check for user creation
    // (7) return response
    // else 
    // (8) return error
    console.log(req);
    const { fullName, email, username, password } = req.body;
    console.log("Full Name : ", fullName);
    console.log("Email : ", email);
    console.log("User Name : ", username);
    console.log("Password : ", password);

    if(
        [ fullName, email, username, password ].some( (field) => (
            field?.trim() === ""
         ) )
    ){
        throw new ApiError(400, "The required fields cannot be empty.");
    }
    if( !( email.lastIndexOf('@') && email.lastIndexOf('.') && email.lastIndexOf('.') < email.length && (email.lastIndexOf('@') === email.indexOf('@') ) && ( email.lastIndexOf('@') < email.lastIndexOf('.') ) ) ){
        throw new ApiError(400, "The email is invalid." );
    }

    const existedUser = User.findOne({ 
        $or: [{ username }, { email }]
    })
    console.log(existedUser);

    if( existedUser ){
        throw new ApiError(409, "User with email or username already exists.");
    }

    //the first_property.path will give the path of the file in our server before going to cloudinary.
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required.");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(avatar){
        throw new ApiError(400, "Avatar file is required.");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Error encountered while registering the user.");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

export { registerUser };