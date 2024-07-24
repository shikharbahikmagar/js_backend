import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, resp) => {

    //get user details from frontend
    //validation - not emppty
    //check if user already exists username, email
    //check for image check for avatar
    //upload them to cloudinary
    //create user object- creat entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return response

    const {fullname, email, username, password} = req.body
    console.log("User details", fullname, email, username, password);


    //validate all fields
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    //check if user already exists
    if(existedUser)
    {
        throw new ApiError(409, "User with email or username already exists");
    }

    //check for image
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    //TODO: console req.files

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar)
    {
        throw new ApiError(500, "avatar file is required");
    }

    //create user object
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    //remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if(!createdUser)
    {
        throw new ApiError(500, "Something went wrong while registering user");
    }
    
    //return response
    return resp.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    )

    

})

export {registerUser}