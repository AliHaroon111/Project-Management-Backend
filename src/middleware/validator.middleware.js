import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";


export const validate = (req,res,next) =>{
    const errors = validationResult(req)    // later more explore - right now jus focus on we are writing some mthods that will be used somewhere
    if(errors.isEmpty()){
        return next()//if we dont have an error then we don't care, W'll just proceed
    }
    
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push( // we push like an object
        { //errors.array() ====> COnvert Object to an Array
            [err.path]:err.msg

        }))
        throw new ApiError(422,"Recieved data is not valid", extractedErrors)
        
}