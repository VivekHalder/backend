import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async ( userId ) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken(); 

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token.");
    }
};

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
    const { fullname, email, username, password } = req.body;
    console.log("Full Name : ", fullname);
    console.log("Email : ", email);
    console.log("User Name : ", username);
    console.log("Password : ", password);

    if(
        [ fullname, email, username, password ].some( (field) => (
            field?.trim() === ""
         ) )
    ){
        throw new ApiError(400, "The required fields cannot be empty.");
    }
    if( !( (email.lastIndexOf('@')!=-1) && (email.lastIndexOf('.')!=-1) && email.lastIndexOf('.') < email.length && (email.lastIndexOf('@') === email.indexOf('@') ) && ( email.lastIndexOf('@') < email.lastIndexOf('.') ) ) ){
        throw new ApiError(400, "The email is invalid." );
    }

    const existedUser = await User.findOne({ 
        $or: [{ username }, { email }]
    })
    console.log(existedUser);

    if( existedUser ){
        throw new ApiError(409, "User with email or username already exists.");
    }

    //the first_property.path will give the path of the file in our server before going to cloudinary.
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;

    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required.");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    let coverImage;
    if(coverImageLocalPath){
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    if(!avatar){
        throw new ApiError(400, "Avatar file is required.");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
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

} );

const loginUser = asyncHandler( async  (req, res, next) => {
    // (1) accept tthe credentials from req.body
    // (2) username or email login 
    // (3) find the user
    // (4) password check
    // (5) access and refresh token
    // (6) send secured cookies
    // (7) send response that sucessfully logged in

    const { email, username, password } = req.body;

    if( !username && !email ){
        throw new ApiError(400, "Username or Email is required.");
    }

    //console.log('Username:', username);
    //console.log('Email:', email);

    const user = await User.findOne({
        $or: [{username}, {email}]
    });

    //console.log("This is the user in the database ", user);

    if(!user){
        throw new ApiError(404, "User doesnot exist.");
    }

    const isPasswordValid = await user.isPasswordCorrect( password );

    if(!isPasswordValid){
        throw new  ApiError(401, "Invalid user credentials.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findOne(user._id).select("-refreshToken -password");

    const options = {

        //not mutable from frontend
        httpOnly: true, 
        secure: true
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully."
        )
    )
} );

const logoutUser = asyncHandler( async (req, res, next) => {
    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie( "accessToken", options )
    .clearCookie( "refreshToken", options )
    .json(new ApiResponse(200, {}, "User logged-out"));
} );

const refreshAccessToken = asyncHandler( async ( req, res, next ) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }
    
    try {
        const decodedRefreshToken = await jwt.verify( incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET );
        
        const user = await User.findById( decodedRefreshToken?._id );
        
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token");
        }
    
        if( incomingRefreshToken !== user?.refreshToken ){
            throw new ApiError(401, "Refresh Token is expired or used.");
        }
    
    
        const { newAccessToken, newRefreshToken } = awaitgenerateAccessAndRefreshTokens( user?._id );
    
        const options = {
            httpOnly: true,
            secure: true
        };
    
        return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken: newAccessToken, refreshToken: newRefreshToken },
                "Access Token Generated"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");   
    }

} );

const changeCurrentPassword = asyncHandler( async ( req, res, next ) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if( newPassword !== confirmPassword ){
        throw new ApiError( 500, "New password and Confirm Password must be same." );
    }

    const user = await User.findById( req.user?._id );

    if(!user){
        throw new ApiError( 500, "Unauthorized Access" );
    }

    const isCorrectPassword = await user.isPasswordCorrect( oldPassword );

    if(!isCorrectPassword){
        throw new ApiError( 500, "Wrong Password" );
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});


    return res.
    status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Password successfully changed"
        )
    );
} );

const getCurrentUser = asyncHandler( async ( req, res, next ) => {
    const user = req.user;

    if( !user ){
        throw new ApiError( 401, "No user logged-in." );
    }

    return res.status( 200 ).json( 200, user, "Current User fetched successfully." );
} );

const updateAccountDetails = asyncHandler( async ( req, res, next ) => {
    const { email, fullname, password } = req.body;

    const user = await User.findById( req.user?._id );

    if(!user){
        throw new ApiError( 400, "Unauthorized Access." );
    }

    const isCorrectPassword = await user.isPasswordCorrect( password );

    if( !isCorrectPassword ){
        throw new ApiError(401, "Wrong Password");
    }

    if( !email || !username ){
        throw new ApiError(401, "Provide atleast one of the email or the fullname.");        
    }

    user.email = email;
    user.fullname = fullname;

    user = user.select( "-password" );

    user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            user,  
            "Account details updated successfully."
        )
    );

} );

const updateUserAvatar = asyncHandler( async ( req, res, next ) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiResponse( 400, "Avatar file is missing." );
    }

    const avatar = await uploadOnCloudinary( avatarLocalPath );

    if( !avatar.url ){
        throw new ApiResponse( 400, "Error while uploading avatar." );        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar
            }
        },
        {
            //setting new to true will return the updated record (user instance)
            new: true
        }
    ).select( "-password" );


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar successfully updated."
        )
    )
} );

const updateUserCoverImage = asyncHandler( async ( req, res, next ) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiResponse( 400, "Cover Image file is missing." );
    }

    const coverImage = await uploadOnCloudinary( coverImageLocalPath );

    if( !coverImage.url ){
        throw new ApiResponse( 400, "Error while uploading Cover Image." );        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage
            }
        },
        {
            //setting new to true will return the updated record (user instance)
            new: true
        }
    ).select( "-password" );


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Cover Image successfully updated."
        )
    )
} );

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage };