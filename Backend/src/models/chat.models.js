import mongoose from 'mongoose';

const chatSchema = new mongoose.model(
    {

    }, 
    {timestamps : true}
);

export const Chat = mongoose.model('Chat', chatSchema);