import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

//validate user authorization and set user to request object
export const verifyJWT = asyncHandler(async (req, _, next) =>{

   try {
        //getting user token from request cookies or header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        //handle no token
        if(!token)
        {
            throw new ApiError(401, "Unauthorized Request")
        }
    
        //verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        //get user
        const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken")
    
        //handle user not found
        if(!user)
        {
            //TODO: discuss about frontend
            throw new ApiError(404, "User not found")
        }
    
        //set user in request object
        req.user = user
    
        //call next middleware or controller
        next()
   } catch (error) {
         throw new ApiError(401, error?.message || "Invalid Access Token")
   }
    
    
})  