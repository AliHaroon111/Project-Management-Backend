import mongoose, {Schema} from "mongoose";      // {model, Schema }   -> i deleted this {model,}
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

// import dotenv from "dotenv";
// dotenv.config()         // don't need to import and config it bcz we already do it in index.js(entry point)

// Method which take object
const userSchema = new Schema({

    avatar:{ 
        type:{
            url:String,
            localPath: String
        },
        default:{
            url:"https://placehold.co/300x300",
            localPath:""

        }
    },
    username :{
        type: String,
        required: true,
        unique : true,
        lowercase : true,
        trim:true,
        index : true
    },
    email : {
        type:String,
        required:true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName:{
        type: String,
        trim: true
    },
    password:{
        type : String,
        required : [true,"Password is Required"]
    },
    isEmailVerified : {
        type : Boolean,
        default: false,
    },
    refreshToken:{
        type:String,

    },
    forgotPasswordToken:{
        type:String
    },
    forgotPasswordExpiry:{
        type: Date
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationExpiry:{
        type: Date
    },

    
},{
    timestamps:true   // to more Fields
}

)

// PreHooks
userSchema.pre("save",async function(next){
    
    if(!this.isModified("password")) return next()   //mean if not mod. do nothing
    this.password = await bcrypt.hash(this.password,10)  // 10 is the hashing value
    next()
})

// Method
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

// -------------->With Data Token<---------------------------
// Access Token(jwt) creation
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(     //jwt.sign(payload, secret, options)
        {
            _id:this._id,
            email:this.email,    
            username: this.username      //This all information is -----> Payload 
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

// Refresh Token(jwt) creation
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)

}
// -------------->With Data Token<---------------------------



// -------------->WithOut Data Token<---------------------------
userSchema.methods.generateTemporaryToken = function(){
    const unHasedToken = crypto.randomBytes(20).toString("hex")

    const hashedToken = crypto
    .createHash("sha256")
    .update(unHasedToken)
    .digest("hex")

    const tokenExpiry = Date.now() + (20*60*1000) //20 min
    return {unHasedToken, hashedToken, tokenExpiry}
}

export const User = mongoose.model("User" ,userSchema)  // export is not included in schema syntax(optional)
 
