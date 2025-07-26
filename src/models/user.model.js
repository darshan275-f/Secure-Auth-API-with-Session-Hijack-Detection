import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        require:true,
        unique:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String
    },
    refreshToken:{
        type:String
    }
},
{
    timestamps:true
})

userSchema.pre('save',async function(next) {
    if(!this.isModified('password')) return next();
    const salt=await bcrypt.genSalt(10);
    const hashPassword=await bcrypt.hash(this.password,salt);
    this.password=hashPassword;
    next();
})

userSchema.methods.comparePassword= async function(newPassword){
     return await bcrypt.compare(newPassword,this.password);
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id: this._id,
        email:this.email,
        userName:this.userName
    },
    process.env.AccessTokenSecret,
    {
        expiresIn:process.env.AccessTokenExpiry
    }
)
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id: this._id
    },
    process.env.RefreshTokenSecret,
    {
        expiresIn:process.env.RefreshTokenExpiry
    }
)
}

const User= mongoose.model('User',userSchema);

export default User;