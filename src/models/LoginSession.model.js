import mongoose from "mongoose";

const loginSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    ipAddress:{
        type:String
    },
    device:{
        type:String
    },
    emailSent:{
        type:Boolean,
        default:false
    }

},{timestamps:true})

const LoginSession=mongoose.model("LoginSession",loginSchema);

export default LoginSession;