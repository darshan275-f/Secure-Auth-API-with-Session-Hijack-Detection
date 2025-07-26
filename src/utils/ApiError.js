class ApiError extends Error{
    constructor(
        message='something went bad',
        statusCode,
        errors

    ){
        super(message);
        this.statusCode=statusCode,
        this.success=false,
        this.data=null,
        this.errors=errors
    }
}

export default ApiError;