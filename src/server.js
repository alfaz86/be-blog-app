require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/usersRoutes');
const articlesRoutes = require('./routes/articlesRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/articles', articlesRoutes);
apiRouter.use('/comments', commentsRoutes);

app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
