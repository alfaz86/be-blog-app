require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const usersRoutes = require('./../src/routes/usersRoutes');
const articlesRoutes = require('./../src/routes/articlesRoutes');
const commentsRoutes = require('./../src/routes/commentsRoutes');
const authRoutes = require('./../src/routes/authRoutes');
const serverless = require('serverless-http');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/images', express.static('images'));

const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/articles', articlesRoutes);
apiRouter.use('/comments', commentsRoutes);

app.use('/api', apiRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

module.exports.handler = serverless(app);
