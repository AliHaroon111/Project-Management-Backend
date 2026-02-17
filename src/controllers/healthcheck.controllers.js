import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
// method
const healthCheck = async(req,res,next) =>{
    try {  //see notes for better undrstng
        const user = await  getUserFromDB()  // dummy for undrstng
        res
        .status(200)
        .json(
            new ApiResponse(200,{message:"Server is runnig"})) //ApiResponse is a class , and here is the Object
    } catch (error) {
       next(err)
    }
}
 */


const healthCheck = asyncHandler( async(req,res)=>{
    res
    .status(200)
    .json(new ApiResponse(200,{message: "Server is running"}))
})
export {healthCheck};