const utilsHelper = {
   // anti-pattern
   sendResponse: function ({
      res,
      status = 200,
      success = true,
      data,
      errors = null,
      message = 'Success',
   }) {
      const response = {};
      if (success) response.success = success;
      if (data) response.data = data;
      if (errors) response.errors = errors;
      if (message) response.message = message;
      return res.status(status).json(response);
   },
};

class AppError extends Error {
   constructor(statusCode, message, errorType) {
      super(message);
      this.statusCode = statusCode;
      this.errorType = errorType;
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
   }
}

// class NotAuthorizedError extends AppError {
//    statusCode = 401;
//    errorType = 'Unauthorized';

//    constructor(message) {
//       super(this.statusCode, message, this.errorType);
//    }
// }

utilsHelper.AppError = AppError;

module.exports = utilsHelper;
