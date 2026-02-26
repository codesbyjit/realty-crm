import { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    tokenVersion: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: string;
}
