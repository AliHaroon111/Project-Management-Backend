// import { User } from "../models/user.models.js"; //help us to query anything fromDB


import jwt from "jsonwebtoken"

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.bod.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unautor.")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
                 )
    const user = User.findById(refreshToken?._id)
    if(!incomingRefreshToken){
        throw new ApiError(401,"Invalid token.")
    }
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired")
    }
    } catch (error) {
        
    }
})