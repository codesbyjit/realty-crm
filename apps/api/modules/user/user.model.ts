import { Schema, model } from "mongoose";
import { IUser } from "./user.types";

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        tokenVersion: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

export const User = model<IUser>("User", userSchema);
