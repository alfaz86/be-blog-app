const { getFormattedImagePath } = require("./imageHelper");

function formatComment(comment) {
  return {
    type_of: 'comment',
    id_code: comment.id,
    created_at: comment.created_at,
    body_html: comment.body_html,
    user: {
      name: comment.name,
      username: comment.username,
      user_id: comment.user_id,
      profile_image: getFormattedImagePath(comment.profile_image),
    },
    children: comment.children,
  };
}

module.exports = { formatComment };