import { User } from "../models/user.models.js"; //help us to query anything fromDB
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";


// Acc/Ref Token generation
const generateAccessAndRefressToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        //comment this(above line) and see below why we crt this
    
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //now we have this user and we can save anything inside this

    user.refreshToken = refreshToken  //not saved yet 
    // to save data
    await user.save({validateBeforeSave:false});  //bcz i'll only touch one field
    return {accessToken,refreshToken};
    
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating acess token"
        );
    }
};
 

const registerUser = asyncHandler( async(req,res) =>{
    const {email,username,password,role} = req.body    //this is how data comes up from FE

    // This is the part you find exising User.......
    //check in DB if The User already exist or not
    const existedUser = await User.findOne({
        $or : [{username},{email}],
    });

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists",[])
    }

    // This is the part you don't find exising User...... then you have to save it in DB
    const user = await User.create({       //here User-->not able to acc schema methods bcz it's the mongoose model but {user} can
        email,
        username,
        password,
        isEmailVerified : false 

    })  //UserSchema k jobhi methods hain unko hum { User } se access ni kar sakte -------> Hum unko { user } se access kar sakty hain  -----> why? bcz User is a mongoose method

    
    const {unHasedToken, hashedToken, tokenExpiry} =  user.generateTemporaryToken()
    //when you run this the all things that it returning in model you got these

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({validateBeforeSave:false});


    await sendEmail({
        email: user?.email,
        subject : "Please verify your email",
        MailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHasedToken}`,
        ),

    });
    
    //Responce back to the request
    const createdUser =await User.findById(user._id).select( // select says i don't want that field
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if(!createdUser){
        throw new ApiError(
            500,"Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                {user:createdUser},
                "User registered succesfully and verification email has been sent to your email"
            )
        )

});



const login = asyncHandler( async(req,res)=>{
    
    const {email,password,username} = req.body

    if(!email){
        throw new ApiError("Email is required")
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(400,"The requested USer Doesn't exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError("Invalid Credentials")
    }
    // is passw correct we need to genr TOKENS(optional)
       const {accessToken,refreshToken}= await generateAccessAndRefressToken(user._id)

    //Responce back to the request
    const loggedInUser =await User.findById(user._id).select( // select says i don't want that field
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );


    //   Now we need to send cookies as well
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {    // we need to send data as well
                user:loggedInUser,
                accessToken,
                refreshToken
                },
                "User logged in successfully" // message
            )
        )
    

});

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id ,// we provide/inject info in req from middleware
        {
            $set:{
                refreshToken:""  // DUY you set it Empty/null undefined
            }
        },
        {
            new:true, // once everthing done give me modt updated object
        }
    );

   const options = {
    httpOnly:true,
    secure:true
   }
   return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(
            new ApiResponse(200,{},"User Logged Out")
        )
});

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current User fethched successfully"
            )
        )
});

const verifyEmail = asyncHandler(async(req,res)=>{
    const {verificationToken}=req.params             //verificationToken  coming form Routes itself

    if(!verificationToken){
        throw new ApiError(400,"Email verification Token is Missing")
    }

    const hashedToken = crypto
    .createHash("sha256")
    .updated(verificationToken) //what do u want to encr
    .digest("hex")

    const user = await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt: Date.now()}
    
    })

    if(!user){
        throw new ApiError(400,"Token is invalid or expire")
    }

    user.emailVerificationToken=undefined;
    user.emailVerificationExpiry=undefined;

    user.isEmailVerified = true
    await user.save({validateBeforeSave: false})

})



export {
    registerUser , login, logoutUser , getCurrentUser
}