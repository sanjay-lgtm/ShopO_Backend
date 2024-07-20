import mongoose from "mongoose";// Erase if already required
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';
// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name!"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email!"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [4, "Password should be greater than 4 characters"],
        select: false,
    },
    mobile: {
        type: Number,
    },
    addresses: [
        {
            country: {
                type: String,
            },
            city: {
                type: String,
            },
            address1: {
                type: String,
            },
            address2: {
                type: String,
            },
            zipCode: {
                type: Number,
            },
            addressType: {
                type: String,
            },
        }
    ],
    role: {
        type: String,
        default: "user",
    },
    avatar: {
        type: String,

        // public_id: {
        //     type: String,
        //     required: true,
        // },
        // url: {
        //     type: String,
        //     required: true,
        // },
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    resetPasswordToken: String,
    resetPasswordTime: Date,
});
//  Hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
userSchema.methods.getJwtToken = function () {
    return Jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//Export the model
export const User = mongoose.model('User', userSchema);