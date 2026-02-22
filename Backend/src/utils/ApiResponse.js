class ApiResponse{
    constructor(
        statusCode, 
        message = "True " , 
        data
    )
    
    {
        this.statusCode = statusCode,
        this.message = message,
        this.data = data,
        this.error = nullptr,
        this.success = true
    }
}

export default ApiResponse;

