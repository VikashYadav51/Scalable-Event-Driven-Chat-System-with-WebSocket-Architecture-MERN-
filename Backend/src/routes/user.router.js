import express from 'express';

import verifyJWT from '../middlewares/user.middlewares.js';

import upload from '../middlewares/multer.js';



import {
   registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    upadateAvatar,
    updateEmailid,
    getProfile,
} from '../controllers/user.controllers.js';

const userRouter = express.Router();

userRouter.post(
  '/register',
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
  ]),
  registerUser  
);

userRouter.post('/login', loginUser);

userRouter.post('/logout', verifyJWT, logoutUser);

userRouter.patch('/password', verifyJWT, updatePassword);

userRouter.patch('/avatar', verifyJWT, upload.single('avatar'), upadateAvatar);

userRouter.patch('/email', verifyJWT, updateEmailid);

userRouter.get('/profile', verifyJWT, getProfile);

userRouter.post('/refresh', refreshAccessToken);

export default userRouter;