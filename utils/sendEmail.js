import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { hashString } from './index.js';
import Verification from '../models/emailVerification.js';
import PasswordReset from '../models/passwordReset.js';

dotenv.config();

const {AUTH_EMAIL,AUTH_PASSWORD,APP_URL} = process.env

let transporter = nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user:AUTH_EMAIL,
        pass:AUTH_PASSWORD
    }
})

export const sendVerificationEmail = async (user, res) => {
    const {_id, email, lastName} = user;
    const token = _id + uuidv4();
    const link = APP_URL + "users/verify/" + _id + "/" + token;
    const mailOption = {
        from: AUTH_EMAIL,
        to: email,
        subject: "Email Verification",
        html: `
            <html>
            <head>
                <title>Email Verification</title>
            </head>
            <body>
                <p>Hello ${lastName},</p>
                <p>Please click the following link to verify your email:</p>
                <button style="background-color: #4CAF50; /* Green */
                    border: none;
                    color: white;
                    padding: 15px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    cursor: pointer;">
                        <a href="${link}" style="text-decoration: none; color: white;">Click Here</a>
                </button>
                <p>If you did not request this verification, please ignore this email.</p>
            </body>
            </html>
        `
    };
    try {
       const hashedToken = await hashString(token)
       
       const newVerifiedEmail = await Verification.create({
        userId:_id,
        token:hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000
       })

       if(newVerifiedEmail){
        transporter
            .sendMail(mailOption)
            .then(()=>{
                res.status(201).send({
                    success:"PENDING",
                    message:"Verification mail has been send to your account, check your email for verification"
                })
            }).catch((err)=>{
                console.log(err)
                res.status(404).json({message:"Something went wrong"})
            })
       }
    } catch (error) {
        console.log(error)
        res.status(404).json({message:"Something went wrong!"})
    }
};

export const resetPasswordLink = async (user, res) => {
    const { _id, email } = user;
  
    const token = _id + uuidv4();
    const link = APP_URL + "users/reset-password/" + _id + "/" + token;
  
    //   mail options
    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: "Password Reset",
      html: `<p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;">
           Password reset link. Please click the link below to reset password.
          <br>
          <p style="font-size: 18px;"><b>This link expires in 10 minutes</b></p>
           <br>
          <a href=${link} style="color: #fff; padding: 10px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px; ">Reset Password</a>.
      </p>`,
    };
  
    try {
      const hashedToken = await hashString(token);
  
      const resetEmail = await PasswordReset.create({
        userId: _id,
        email: email,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
      });
  
      if (resetEmail) {
        transporter
          .sendMail(mailOptions)
          .then(() => {
            res.status(201).send({
              success: "PENDING",
              message: "Reset Password Link has been sent to your account.",
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(404).json({ message: "Something went wrong" });
          });
      }
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Something went wrong" });
    }
  };
