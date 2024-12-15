class ErrorHandler extends Error {
    public statusCode: number;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
  
      // Captures the stack trace of this custom error class
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default ErrorHandler;
  