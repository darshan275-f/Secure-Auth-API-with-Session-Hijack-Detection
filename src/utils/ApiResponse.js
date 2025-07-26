class ApiResponse extends Error{
    constructor(message,statusCode,data){
        super(message),
        this.statusCode=statusCode,
        this.data=data,
        this.success=statusCode<400
    }
}

export default ApiResponse;