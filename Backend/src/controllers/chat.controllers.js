import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const accessChat = asyncHandler( async(req, res, next) =>{
    const { userId } = req.body;
    
    if(!userId){
        throw new ApiError(400, "UserId param not sent with request", userId);
    }

    let isChatExist = await Chat.findOne({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } }, // loged in user
            { users: { $elemMatch: { $eq: userId } } }, // user whom with chat will happen
        ],
    });

    if(!isChatExist){
        throw new ApiError(404, "Chat not found", isChatExist);
    }

    return res.status(201)
    .json(
        new ApiResponse(201, "Chat accessed successfully", isChatExist)
    )
});


const createChat = asyncHandler( async(req, res, next) =>{
    const { userId, chatContent } = req.body;
    
    if(!userId){
        throw new ApiError(400, "UserId param not sent with request", userId);
    }

    let chat = await Chat.create({
        chatName: "Chat",
        isGroupChat: false,
        user: [req.user._id, userId],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
    });

    return res.status(201)
    .json(
        new ApiResponse(201, "Chat created successfully", chat)
    )
});


const createGroupChat = asyncHandler( async(req, res, next) =>{

    if (!req.body.user || !req.body.name) {
        return next(new ApiError(400, "Please Fill all the feilds", { user: req.body.user, name: req.body.name }));
    }

    let users = JSON.parse(req.body.user); //  JSON string into a JavaScript object.
    
    if(users.length < 2){
        return next(
            new ErrorHandler("More than 2 users are required to form a group chat" , 400)
        ); 
    }

    // add logged user or who is looged in into group as well beacuse he is cerating group thoug  he will admin as well.
    users.push(req.user);

  
    const groupChat = await chatModel.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
    });

    const fullGroupChat = await chatModel
        .findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    res.status(200).json(
        new ApiResponse(200, "Group chat created successfully", fullGroupChat)
    );
});


const removeFromGroup = asyncHandler( async(req, res, next) =>{
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
        return next(new ApiError(400, "Please Fill all the feilds", { chatId, userId }));
    } 

    // check if the requester is admin or not

    const removed = await chatModel
        .findByIdAndUpdate(chatId, {
        $pull: { user: userId }, // pull the user froM users array in groupchat
    })

    .populate("users", "-password")
    .populate("groupAdmin", "-password");

    if (!removed) {
        return next(new ApiError(404, "Chat not found", removed));  
    } 

    
    res.status(200).json(
        new ApiResponse(200, "User removed from group successfully", removed)
    );
});


const addToToGroup = asyncHandler( async(req, res, next) =>{
    const { chatId, userId } = req.body;

    if (!userId || !chatId) {
        return next(new ApiError(400, "Please Fill all the feilds", { userId, chatId }));
    }

    const isUser = await chatModel.findOne({ _id: chatId, user: userId }); // check if user is already in group or not
 
    if (isUser) { 
        return next(new ApiError(400, "User already in group", { userId, chatId }));
    }

    const added = await chatModel
      .findByIdAndUpdate(
        chatId,
        {
          $push: { user: userId }, // adding in users array in groupChat model
        },

        {
          new: true,
        }
      )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");


    if (!added) {
        return next(new ApiError(404, "Chat not found", added));
    }

    res.status(200).json(
    new ApiResponse(200, "User added to group successfully", added)
    );
    
});


const renameGroup = asyncHandler( async(req, res, next) =>{
        
    const {chatId , chatName}  = req.body;

    const updatedChat = await chatModel
    .findByIdAndUpdate(
        chatId,
        {
        chatName: chatName,
        },
        {
        new: true,
        }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");


    if (!updatedChat) {
        return next(new ApiError(404, "Chat not found", updatedChat));
    } 

    res.status(200).json(
        new ApiResponse(200, "Chat name updated successfully", updatedChat)
    );
});


const getAllChats = asyncHandler( async(req, res, next) =>{
    const userID = req.user._id;

    const chats = await chatModel.find({
      users: { $elemMatch: { $eq: userID } },
    })

    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 }); // message latestMessage will send by latest updatedAt


    const results = await userModel.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if(!results){
        return next(new ApiError(404, "Chat not found", results));
    }

    res.status(200).json(
        new ApiResponse(200, "Chats fetched successfully", results)
    );
});


export {
    accessChat,
    createGroupChat,
    removeFromGroup,
    addToToGroup,
    renameGroup,
    getAllChats,
}