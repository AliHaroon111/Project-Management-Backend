import { body } from "express-validator";


const userRegisterValidator = () =>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")       // for every err getting we have to call withMessage
        .isEmail()
        .withMessage("Email is invalid"), // this field completed you can go to next
        
        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLowercase()
        .withMessage("Username must be in lower case")
        .isLength({min:3})
        .withMessage("The username must be at least 3 characters"),

        body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required"),

        body("fullName")
        .optional()
        .trim()
        

        
    ]

}

const userLoginValidator = ()=>{
        return [
            body("email")
            .optional()
            .isEmail()
            .withMessage("Email is invalid"),
            body("password")
            .notEmpty()
            .withMessage("Password is required")

        ]
    }

const userChangeCurrentPasswordValidator = ()=>{
    return [
        body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),

        body("newPassword")
        .notEmpty() //if it's empty then we going to respnod withMessage
        .withMessage("New password is required"),
    ]
}

const userForgotPasswordValidator = () =>{
    return [
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid")
    ]
}

const userResetForgotPasswordValidator = ()=>{
    return [
        body("newPassword")
        .notEmpty()
        .withMessage("Password is required")
    ]
}

export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator
}