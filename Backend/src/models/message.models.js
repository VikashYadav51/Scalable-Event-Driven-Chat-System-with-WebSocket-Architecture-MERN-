import mongoose from 'mongoose';

const messageSchema = new mongoose.model(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        content : {
            type : String,
            trim : true,
        },

        messageType: {
            type: String,
            enum: ["text", "image", "video", "file"],
            default: "text",
        },

        fileUrl: {
            type: String,
        },

        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
        },
    }, 

    {timestamps : true}
);

messageSchema.index({ conversation: 1, createdAt: 1 });


export const Message = mongoose.model('Message', messageSchema);
