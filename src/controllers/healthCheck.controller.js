import ApiResponse from "../utils/ApiResponse.js"

const healthCheck=(req,res)=>{
    res.status(200).json(new ApiResponse("Ok",200,{}))
}

export {
    healthCheck
}