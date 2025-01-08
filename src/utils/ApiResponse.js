class ApiResponse {
  /**
   * Success response
   *
   * @param {Object} res - Express response object
   * @param {any} data - Data to return
   * @param {string} [message='Success'] - Success message
   * @param {number} [status=200] - HTTP status code
   */
  static successResponse(res, data, message = 'Success', status = 200) {
    return res.status(status).json({
      status: 'success',
      message: message,
      data: data,
    });
  }

  /**
   * Error response
   *
   * @param {Object} res - Express response object
   * @param {string} [message='Error'] - Error message
   * @param {number} [status=400] - HTTP status code
   * @param {any} [errors=null] - Error details
   */
  static errorResponse(res, message = 'Error', status = 400, errors = null) {
    const response = {
      status: 'error',
      message: message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(status).json(response);
  }

  /**
   * Response for not found resources
   *
   * @param {Object} res - Express response object
   * @param {string} [message='Resource not found'] - Not found message
   */
  static notFoundResponse(res, message = 'Resource not found') {
    return this.errorResponse(res, message, 404);
  }

  /**
   * Response for unauthorized access
   *
   * @param {Object} res - Express response object
   * @param {string} [message='Unauthorized'] - Unauthorized message
   */
  static unauthorizedResponse(res, message = 'Unauthorized') {
    return this.errorResponse(res, message, 401);
  }

  /**
   * Response for validation error
   *
   * @param {Object} res - Express response object
   * @param {any} [errors=null] - Validation error details
   * @param {string} [message='Validation errors'] - Validation error message
   * @param {number} [status=422] - HTTP status code
   */
  static validationResponse(res, errors = null, message = 'Validation errors', status = 422) {
    return res.status(status).json({
      status: 'error',
      message: message,
      data: errors,
    });
  }
}

module.exports = ApiResponse;
