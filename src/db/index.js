import mongoose from "mongoose";

import ApiError from "../utils/ApiError.js";

const connectToDb=async()=>{
    try{
    await mongoose.connect(`${process.env.dbURL}\authApi`);
    console.log("DB connected");
    }
    catch(Err){
        throw new ApiError("Error while connecting to DB",500);
    }
}
export default connectToDb;