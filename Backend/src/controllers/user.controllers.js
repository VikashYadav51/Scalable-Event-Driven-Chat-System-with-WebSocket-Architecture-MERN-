import { User } from '../models/user.models.js'
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import { uploadOnCloudinary } from '../utils/cloudinary.js';


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, password, fullName } = req.body;

    if ([userName, email, password, fullName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    console.log(`req.files avatar ${req.files}`);

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
    });

    if (!user) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, "User registered successfully", user)
    )
});


const loginUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;

    if (!userName || !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]  
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, "User logged in successfully", { loggedInUser, accessToken, refreshToken })
    )
});


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(200, "User logged out successfully")
    )
});


const updatePassword = asyncHandler( async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if(!(oldPassword || newPassword )){
        throw new ApiError(400, "All fields are required", { oldPassword, newPassword });
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "New password and confirm password do not match", { newPassword });
    }

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404, "User not found", { oldPassword, newPassword });
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid old password", { oldPassword, newPassword });
    }

    user.password = newPassword;

    const savepassword = await user.save({ validateBeforeSave : false });

    return res.status(200).json(
        new ApiResponse(200, "Password updated successfully", { nullptr })
    )
});


const upadateAvatar = asyncHandler( async(req, res) =>{
    console.log(`req.files avatar ${req.files}`);

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required", { avatarLocalPath });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar upload failed", { avatarLocalPath });
    }

    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(404, "User not found", { avatarLocalPath });
    }

    user.avatar = avatar.url;
    await user.save({ validateBeforeSave : false });

    return res.status(200).json(
        new ApiResponse(200, "Avatar updated successfully", {})
    )
});


const updateEmailid = asyncHandler( async(req, res) =>{
    const { oldEmailId, newEmailId } = req.body;

    if( !oldEmailId || !newEmailId ){
        throw new ApiError(401, "All field is required");
    }

    const user = User.findById(oldEmailId?._id);

    if(!user){
        throw new ApiError(401, "Unauthourised access ");
    }

    user.oldEmailId = newEmailId;

    await user.save({validateBeforeSave :  false});

    return res.status(201).json(
        new ApiResponse(201, "Email id  Update successfully ", newEmailId)
    )
});


const getProfile = asyncHandler( async(req, res) =>{
    const user = await User.findById(req.user?._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "User profile fetched successfully", user)
    )
});


const refreshAccessToken = asyncHandler( async(req, res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, 'Unauthorized request' );
    }

    try{
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);

        const user = await User.findById(decodedToken?._id);    
        if(!user){
            throw new ApiError(401, 'Invalid refresh token')
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, 'Refresh token is expired or used')
        }

        const { accessToken, newRefreshToken } =  await generateAccessAndRefreshTokens(user._id);

        const cookieOption = {
            httpOnly : true,
            secure : true,
        }

        return res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", newRefreshToken, cookieOption)
        .json(
            new ApiResponse(200, "Access token refreshed successfully", { accessToken, refreshToken: newRefreshToken })
        )
    } 
    
    catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token');
    }
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    upadateAvatar,
    updateEmailid,
    getProfile,
};



