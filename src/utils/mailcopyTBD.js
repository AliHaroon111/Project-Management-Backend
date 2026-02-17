import Mailgen from "mailgen";
import nodemailer from "nodemailer"

/**
 * 
 * we need to send email
 * So 
 * First we have to generate email
 * now move to send email But Before send email 
 * We need to prepare the email
 */

const sendEmail = async (options)=>{
  const mailGenerator = new Mailgen({
    theme:"default",
    product:{
      name:"ProjManage",
      link:"https://taskmangelink.com"
    } 
  });

  const emailTextual1 = mailGenerator.generatePlaintext(options.MailgenContent)
  const emailHTML = mailGenerator.generate(options.MailgenContent)


  const transporter = nodemailer.createTransport({
    host:process.env.MAILTRAP_SMTP_HOST,
    port:process.env.MAILTRAP_SMTP_PORT,
    auth:{
      user:process.env.MAILTRAP_SMTP_USER,
      pass:process.env.MAILTRAP_SMTP_PASS
    }
  })

  const email = await transporter.sendMail({
    from:"aliharoon0111@gmail.com",
    to:options.email,
    subject:options.subject,
    text:emailTextual1,
    html:emailHTML
  })

  try {
    await transporter.sendMail(email)
  } catch (error) {
    console.error(error)
  }
}


const VerifyEmailMaingenContent = (username,verificationURL)=>{
  return {
    body:{
      name:username,
      intro:"Welcome to ProjManage! We\'re very excited to have you on board."
    },
    action:{
      instructions: 'To get started with ProjManage, please click here:',
      button:{
        color:"#22BC66",
        text:"Confirm your account",
        link: verificationURL
      }
    },
     outro : "Need help, or have question just reply to this email, we'd love to help."
  }
}


const forgotPasswordMaingenContent = (username,resetPassword)=>{
  return {
    body:{
      name:username,
      intro:"we got a request to reset the password of your account."
    },
    action:{
      instructions: 'To reset your password click on the following button or link',
      button:{
        color:"#22BC66",
        text:"Reset Pass",
        link: resetPassword
      }
    },
     outro : "Need help, or have question just reply to this email, we'd love to help."
  }
}


export {
  VerifyEmailMaingenContent,
  forgotPasswordMaingenContent,
  sendEmail
};