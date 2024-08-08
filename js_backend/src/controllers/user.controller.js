import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccesAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAcessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        
        throw new ApiError(500, "something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // let avatarLocalPath;
    // if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
      const  avatarLocalPath = req.files?.avatar[0]?.path
    //}
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, "User registered Successfully", createdUser)
    )

} )

const loginUser = asyncHandler( async(req, res) => {

    
    // get user details from frontend
    // validation - not empty
    // check if user exists
    // check password
    // generate token (access or refresh)
    //send cookies
    // return res

    const {username, email, password} = req.body
    console.log(email);
    //check if username or email is entered
    if(!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    //check if user exists
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    //handle user not found
    if(!user)
    {
        throw new ApiError(404, "user does not exist")
    }

    //check password
    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect)
    {
        throw new ApiError(401, "Invalid credentials")
    }

    //generate token
    const {refreshToken, accessToken} = await generateAccesAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
    
})

//user logout
const logoutUser = asyncHandler(async (req, resp) => {
    //get user from request object
    //set refresh token to null
    //send response
    //return res

    const user = req.user

    //set refresh token to undefined
    await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }
    
    return resp.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, "User logged out successfully")
        )
})
//refresh access token
const refreshAccessToken = asyncHandler(async(req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    //handle no token
    if(!incomingRefreshToken)
    {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        //verify token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        //handle invalid token
        if(!decodedToken)
        {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        //get user
        const user = await User.findById(decodedToken?._id)
    
        //handle user not found
        if(!user)
        {
            throw new ApiError(404, "Invalid Refresh Token")
        }
    
        //compare incoming token with stored token
        if(user?.refreshToken !== incomingRefreshToken)
        {
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
    
        const options = {
            httpOnly: true,
            secure: true
        }
        //generate new access and refresh token
        const {accessToken, newRefreshToken} = await generateAccesAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {accessToken, newRefreshToken}, "Token refreshed successfully")
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
        
    }


})
//change user current password
const changeCurrentPassword = asyncHandler( async(req, res) => {

    const {oldPassword, newPassword, confPassword} = req.body

    //check new password and confirm password
    if(!(newPassword === confPassword))
    {
        throw new ApiError(400, "new password and confirm password doesnot match")
    }

    //get user with the help of middleware
    const user = await User.findById(req.user?._id)

    //call isPasswordCorrect method to check user current password
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    //handle not correct
    if(!isPasswordCorrect)
    {
        throw new ApiError(400, "Invalid old Password")
    }

    //change password
    user.password = newPassword

    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed Successfully")
    )
})
//get current user
const getCurrentUser = asyncHandler( async(req, res) => {

    return res.status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})
//update user details
const updateAccountDetails = asyncHandler(async (req, res) => {

    const {fullName, email} = req.body

    if(!fullName && !email)
    {
        throw new ApiError(400, "All fields are required")
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                //if field and variable is same we can use insted of fullName: fullName, email: email
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))

})

//update user avatar
const updateUserAvatar = asyncHandler(async(req, res) => {

    const {avatarLocalPath} = req.file?.path

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url)
    {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully"))
    
})


const updateUserCoverImage = asyncHandler(async(req, res) => {

    const {coverImageLocalPath} = req.file?.path

    if(!coverImageLocalPath)
    {
        throw new ApiError(400, "Cover Image File is Missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage)
    {
        throw new ApiError(400, "Error while uploading to cloudinary")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated Successfully"))

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}