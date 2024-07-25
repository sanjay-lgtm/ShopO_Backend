import express from 'express';
import { User } from "../model/user.js";

import ErrorHandler from "../utils/ErrorHandler.js";
import path from 'path';
import fs from 'fs';
import Jwt from 'jsonwebtoken';
import { sendMail } from "../utils/sendMail.js";
import { Upload } from '../multer.js';
import asyncHandler from '../middleware/catchAsyncErrors.js';
import { sendToken } from '../utils/jwtToken.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

//create user

router.post("/create-user", Upload.single("file"), async (req, res, next) => {
    try {
        const { name, email, password, avatar } = req.body;
        const userEmail = await User.findOne({ email });

        if (userEmail) {
            const filename = req.file.filename;
            const filePath = `uploads/${filename}`;
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        success: false,
                        message: "Error deleting file"
                    })
                }
            })
            return next(new ErrorHandler("User already exists", 400));
        }

        const filename = req.file.filename;
        const fileUrl = path.join(filename);

        const user = {
            name: name,
            email: email,
            password: password,
            avatar: fileUrl
        }
        // const newUser = await User.create(user); 
        // res.status(201).json({
        //     success: true,
        //     user:newUser
        // })
        const activationToken = createActivationToken(user)
        const activationUrl = `http://localhost:5173/activation/${activationToken}`
        try {
            await sendMail({
                email: user.email,
                subject: "Account activation",
                message: `<h1>Hello,${user.name} Please click the following link to activate your account:</h1>
                <a href=${activationUrl} clicktracking=off>${activationUrl}</a>`

            })

            res.status(201).json({
                success: true,
                message: `please check your email :- ${user.email} to activate your account!`,
            })
        } catch (error) {
            return next(new ErrorHandler(error.message, 500))
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
});

//create activation Token

const createActivationToken = (user) => {
    return Jwt.sign(user, process.env.ACTIVATION_SECREAT, {
        expiresIn: '1hr'
    })
}

//activate user
router.post('/activation', asyncHandler(async (req, res, next) => {
    try {
        const { activation_token } = req.body;

        const newUser = Jwt.verify(activation_token, process.env.ACTIVATION_SECREAT);
        if (!newUser) {
            return next(new ErrorHandler("Invalid token", 400))
        }
        const { name, email, password, avatar } = newUser;

        let user = await User.findOne({ email })
        if (user) {
            return next(new ErrorHandler("User already exist", 400))
        }
        user = await User.create({
            name,
            email,
            avatar,
            password,
        })
        sendToken(user, 201, res);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
}))

router.post('/login-user', asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("please provide the all fields!", 400))
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("User does't exists!", 400))
        }

        const isPasswordValid = await user.comparePassword(password)

        if (!isPasswordValid) {
            return next(new ErrorHandler("Password is incorrect!", 400))
        }
        sendToken(user, 201, res);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
}))

router.get('/getuser',isAuthenticated,asyncHandler(async(req,res,next)=>{
    try {
        const user = await User.findById(req.user.id)

        if(!user){
            return next(new ErrorHandler("User doen't exists!",400))
        }
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
}))

// logout user
router.get('/logout',isAuthenticated,asyncHandler(async(req,res,next)=>{
    try {
         res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true,
         })
         res.status(200).json({
            success:true,
            message:"Logged out successfully"
         });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }

}))

export default router;