class ApiError extends Error{
    statusCode;
    message = "Something went wrong";
    error = [];
    stack = "";

    constructor(statusCode, message, error){
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.error = error;
        this.success = false;
        
        if(stack){
            this.stack = stack;
        }

        else{
            Error.captureStackTrace(this, this.stack);
        }
    }
}

export default ApiError;