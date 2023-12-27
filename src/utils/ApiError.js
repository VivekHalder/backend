class ApiError extends Error {
    constructor (
        statusCode, 
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.sucuess = false;
        this.data = null;

        if(stack){
            this.stack = stack;
        } else{
            Error.captureStackTrace(this, this.consttructor);
        }
    }
}

export { ApiError };