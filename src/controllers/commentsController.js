const db = require('../config/db');
const ApiResponse = require('../utils/ApiResponse');
const { formatComment } = require('../utils/commentHelper');

exports.getCommentsByArticleId = async (req, res) => {
  const articleId = req.query.a_id;

  try {
    // Ambil komentar utama dan komentar anak (jika ada)
    const [comments] = await db.query(
      `
      SELECT 
        comments.id,
        comments.body_html,
        comments.created_at,
        comments.updated_at,
        comments.parent_comment_id,
        users.id AS user_id, 
        users.name,
        users.username,
        users.email,
        users.profile_image
      FROM comments
      LEFT JOIN users ON comments.user_id = users.id
      WHERE comments.article_id = ?
      ORDER BY comments.created_at ASC
      `,
      [articleId]
    );

    if (comments.length === 0) {
      return ApiResponse.successResponse(
        res,
        [],
        'No comments found for this article',
        200
      );
    }

    // Membuat map untuk menyimpan komentar berdasarkan ID untuk memudahkan pengelompokkan anak
    const commentsMap = {};
    comments.forEach(comment => {
      comment.children = []; // Inisialisasi children untuk setiap komentar
      commentsMap[comment.id] = comment;
    });

    const formattedComments = [];

    // Menambahkan children ke setiap komentar berdasarkan parent_comment_id
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parentComment = commentsMap[comment.parent_comment_id];
        if (parentComment) {
          parentComment.children.push(formatComment(comment));
        }
      } else {
        // Jika komentar adalah komentar utama (tanpa parent)
        formattedComments.push(formatComment(comment));
      }
    });

    return ApiResponse.successResponse(
      res,
      formattedComments,
      'Comments article',
      200
    );

  } catch (error) {
    return ApiResponse.errorResponse(res, error.message, 500);
  }
};

exports.createComment = (req, res) => {
  return ApiResponse.errorResponse(res, 'This module is not implemented yet', 501);
};
