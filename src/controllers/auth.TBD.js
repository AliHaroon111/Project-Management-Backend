import { User } from "../models/user.models";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";



const generateAccessAndRefressToken = async(userId)=>{
    try {
        const user =User.findById(userId)

    const accessToken =user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken= refreshToken
    await user.save({})
    } catch (error) {
        
    }

   
}


// const registerUser = asyncHandler(async(req,res)=>{
//     const {username,email,password,role} = req.body

//     const existingUser = await User.findOne({
//         $or:[{username},{email}]  
//     })

//     if(existingUser){
//         throw new ApiError(406,"The User already exist",[])
//     }

//     const user = await User.create({
//         username,
//         email,
//         password,
//         isEmailVerified: false
//     })

//     const {unHasedToken, hashedToken, tokenExpiry}=user.generateTemporaryToken()
// })



// For exam purpose without using utils
try {
    
    
    const registerUser = asyncHandler(async(req,res)=>{
        const{username,email,password}  =  req.body
    
        if(!email){
            return res.status(400)
                .json(success:false,message:"Please provide the email address,MUST TAKEN")
        }
    
        const existedUser = User.findOne({
            $or:[{email},{username}]
        })
    
        if(existedUser){
            return res.status(409).json(
                success:false,
                message:"User already Exists"
            )
        }
    
        const user = await User.create({
            username,
            email,
            password,
            role:role || 'operator',
            isEmailVerified:false
        })
    
        return  res
                .status(201)
                .json({
                    success:true,
                    message:"User registered Successfuly",
                    data:{
                        _id:user._id,
                        username:user.username,
                        email:user.email,
                        role:user.role
                    }
                })
    })
} catch (error) {
    console.error("Registration Error:", error);

        return res.
        status(500).
        json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    
}