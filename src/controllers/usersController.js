const db = require('../config/db');
const ApiResponse = require('../utils/ApiResponse');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, username, email FROM users');
    return ApiResponse.successResponse(
      res,
      users,
      'All users',
      200
    );
  } catch (error) {
    return ApiResponse.errorResponse(res, error.message, 500);
  }
};
