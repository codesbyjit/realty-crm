import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    role: {
        type: String,
        enum: ["OWNER", "AGENT"],
        default: "AGENT",
    },
    isAccepted: {
        type: Boolean,
        default: false,
    },
    isRemoved: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

export const Membership = mongoose.model("Membership", membershipSchema);
