// import { text } from "express";
import Mailgen from "mailgen";
import nodemailer from "nodemailer";

/**
 * First learn about how to create/generate Email(efficiently)
 * Then move to send Email
 */

// Sending the email(transporter)

import 'dotenv/config';
// console.log('DEBUG HOST:', process.env.MAILTRAP_SMTP_HOST);
// console.log('DEBUG PORT:', process.env.MAILTRAP_SMTP_PORT);
const transporter = nodemailer.createTransport({     //nodemailer.createTransport  --> keywords
    host:process.env.MAILTRAP_SMTP_HOST,
    port:process.env.MAILTRAP_SMTP_PORT
    ,
    auth:{
        user:process.env.MAILTRAP_SMTP_USER,
        pass:process.env.MAILTRAP_SMTP_PASS,
    }
})


// Sending the email(preparing)===> Branding(SEE DOCS)
const sendEmail = async (options )=>{
    const mailGenerator = new Mailgen({
        theme :"default",
        product:{
            name:"Task Manager",
            link:"https://taskmangelink.com"
        }
    });
    const emailTextual = mailGenerator.generatePlaintext(options.MailgenContent)
    const emailHTML = mailGenerator.generate(options.MailgenContent)
    
    // email about to send
    const mail = {
        from:"aliharoon0111@gmail.com",
        to: options.email,
        subject : options.subject,
        text: emailTextual,
        html: emailHTML
    };
    
    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service failed siliently ,(this might happen because of credential) make sure that you have provided your MAILTRAP credential in the .env file");
        console.error("Error",error)
    }
}



// generating email
const emailVerificationMailgenContent = (username,verificatioUrl) =>{
    return{

        body:{
            name:username,
            intro:"Welcome to Our App! We'are excited to see you on board.",
            action:{
                Instructions:"To verify your email please click on the following button",
                button:{
                    color:'#22BC66', //optional
                    text : "Verify your email",
                    link : verificatioUrl
    
                },
            },
            // outro start after the actions
            outro : "Need help, or have question just reply to this email, we'd love to help."
        },
    }
}

// same as above - // generating email
const forgotPasswordMailgenContent = (username,passwordResetUrl) =>{
    return{

        body:{
            name:username,
            intro:"we got a request to reset the password of your account.",
        },
        action:{
            Instructions:"To reset your password click on the following button or link",
            button:{
                color:'#22BC66', //optional
                text : "Reset Password",
                link : passwordResetUrl

            },
        },
        // outro start after the actions
        outro : "Need help, or have question just reply to this email, we'd love to help."
    }
}

export {
    emailVerificationMailgenContent,
     forgotPasswordMailgenContent,
     sendEmail
    };