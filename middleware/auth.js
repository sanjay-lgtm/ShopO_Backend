import ErrorHandler from "../utils/ErrorHandler.js";
import asyncHandler from "./catchAsyncErrors.js";
import Jwt from 'jsonwebtoken';
import { User } from "../model/user.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
   const {token} = req.cookies;

   if(!token){
    return next(new ErrorHandler('Please Login to access this resource', 401));
   }

   const decoded = Jwt.verify(token,process.env.JWT_SECRET_KEY);
   req.user = await User.findById(decoded.id)
   next();
})