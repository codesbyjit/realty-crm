import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },  
    type: {
        type: String,
        enum: ["SOLO", "TEAM"],
        required: true,
    }  
}, {
    timestamps: true,
});

export const Workspace = mongoose.model("Workspace", workspaceSchema);