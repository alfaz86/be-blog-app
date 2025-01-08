const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const s3Client = require('../config/aws');
require('dotenv').config();

const bucketName = process.env.AWS_BUCKET_NAME;

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    // acl: 'public-read', // Optional: Izinkan akses publik
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `articles/${Date.now()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
    contentType: (req, file, cb) => {
      cb(null, file.mimetype); // Pastikan mimetype diatur dengan benar
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // Batas ukuran file 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only JPEG, JPG, PNG, and GIF are allowed!'));
    }
  },
});

module.exports = upload;
