import mongoose from 'mongoose';

const chatSchema = new mongoose.model(
    {
        chatName : {
            type : String,
            // required : true,
            default : 'Chat',
            trim : true,
        },

        isGroupChat : {
            type : Boolean,
            default : false,
        },

        user: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },

        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }, 
    }, 

    {timestamps : true}
);

export const Chat = mongoose.model('Chat', chatSchema);