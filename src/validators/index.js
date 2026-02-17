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

export {
    userRegisterValidator,userLoginValidator
}