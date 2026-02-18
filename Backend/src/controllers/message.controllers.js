import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Message } from "../models/message.models.js";

const getAllMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId }).populate("Sender", "name pic email").populate("chat");
    if (!messages) {
        throw new ApiError(404, "Messages not found");
    }
    res.status(200).json(
        new ApiResponse(200, "Messages fetched successfully", messages)
    );
});

const sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Message content is required");
    }
    const message = await Message.create({
        chat: chatId,
        content,
        sender: req.user._id,
    });

    if (!message) {
        throw new ApiError(500, "Something went wrong while sending the message");
    }

    await message.populate("sender", "name pic");
    await message.populate("chat");
    await userModel.populate(message, {
        path: "chat.users",
        select: "name pic email",
    });

    // now update lastest message  beacuse when user communicate everytime lastest message will change
    await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
    });

    res.status(201).json(
        new ApiResponse(201, "Message sent successfully", message)
    );
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) {
        throw new ApiError(404, "Message not found");
    }
    await message.deleteOne();

    // now update lastest message  beacuse when user communicate everytime lastest message will change
    await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: null,
    });

    res.status(200).json(
        new ApiResponse(200, "Message deleted successfully")
    );
});


const updateMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Message content is required");
    }
    // check if message is sent by logged in user
    if (message.sender.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this message");
    }


    const message = await Message.findById(messageId);

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    message.content = content;

    // now update lastest message  beacuse when user communicate everytime lastest message will change
    await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
    });

    res.status(200).json(
        new ApiResponse(200, "Message updated successfully", message)
    );
});



export {
    getAllMessage,
    sendMessage,
    deleteMessage,
    updateMessage,
    
}
