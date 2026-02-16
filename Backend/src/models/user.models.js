import mongoose from 'mongoose';

import jwt from 'jsonwebtoken';

import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        index : true,
    },

    email : {
        type : String,
        required : true,
        unique : true,
    },

    password : {
        type : String,
        required : true,
    },

    fullName : {
        type : String,
        required : true,
    },

    avatar : {
        type : String,
        default : required,
    },

    isAdmin : {
        type : Boolean,
        required : true,
        default : false,
    }

}, {timestamps : true});

userSchema.pre('save', async function() {
    if(this.isModified(this.password)){
        const hasingPassword = await bcrypt.hash(this.password, 15);
        console.log(`hasing password is  ${hasingPassword}`);
        next();
        return ;
    }
    next();
    return ;
});


userSchema.methods.isPasswordCorrect = () =>{
    const checkPassword = bcrypt.compare(password, this.password);
    console.log(`Check password will be ${checkPassword}`);
    return checkPassword;
}

userSchema.methods.accessToken = async ()=>{
    const accessToken = await jwt.sign(
        {
            _id : this._id,
            email : this.email,
            userName : this.userName,
            password : this.password,
        }, 

        process.env.ACCESS_TOKEN_SECRET_KEY, 

        {expiresIn : process.env.ACCESS_TOKEN_EXPIRE_TIME}
    );

    console.log(`access token is ${accessToken}`);

    return accessToken;
}


userSchema.methods.refreshToken = async ()=>{
    const refreshToken = await jwt.sign(
        {
            _id : this._id,
            email : this.email,
            userName : this.userName,
            password : this.password,
        }, 

        process.env.REFRESH_TOKEN_SECRET_KEY, 

        {expiresIn : process.env.REFRESH_TOKEN_EXPIRE_TIME}
    );

    console.log(`access token is ${refreshToken}`);

    return refreshToken;
}

export const User = mongoose.model("User", userSchema);
