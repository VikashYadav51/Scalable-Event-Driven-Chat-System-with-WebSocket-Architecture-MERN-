import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const createChatController = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "UserId param not sent with request");
    }

    const isChatExist = await Chat.findOne({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } }, // loged in user
            { users: { $elemMatch: { $eq: userId } } }, // user whom with chat will happen
        ],
    });

    if (isChatExist) {
        res.send(isChatExist);
        return;
    }

    const chat = await Chat.create({
        chatName: "sender",
        users: [req.user._id, userId],
        isGroupChat: false,
    });

    const fullChat = await Chat.findOne({ _id: chat._id }).populate(
        "users",
        "-password"
    );

    res.status(200).json(fullChat);
});


