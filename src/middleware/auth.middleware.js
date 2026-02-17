import { header } from "express-validator";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from 'jsonwebtoken'
import "dotenv/config"


export const verifyJWT = asyncHandler( async (req,res,next)=>{
    
    // need to extract/grab the accessToken

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    // these header we crt on postman AON
    //cookies?.accessToken ------> optionally if access the token
    // We are replaceing { "Bearer " } bcz we only need Token not bearer

    if(!token){
        throw new ApiError(401,"Unauthorized request")
    }
    
    // if we get accTok then we need to decode
    try {
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user =await User.findById(decodeToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

        if(!user){
            throw new ApiError(401,"Your token is Not Valid")
        }
        req.user = user
        next()
        // inject infor. to req
    } catch (error) {
        throw new ApiError(401,"Invalid Access Token")
        
    }
});
