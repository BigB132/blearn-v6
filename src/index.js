const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const mongoose = require('mongoose')

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));

mongoose.connect(process.env.DB_URI).then(() => {
    console.log('MongoDB connected successfully')
})

const websiteRouter = require('./controllers/websiteController');
const { authRouter } = require('./controllers/authController');
const mainModuleController = require('./controllers/mainModuleController');

app.use('/', websiteRouter)
app.use('/api/auth', authRouter)
app.use('/api/mainModules', mainModuleController)

app.use(express.static(path.join(__dirname, 'static')))

app.listen(process.env.PORT, () => {
    console.log('Server running on port ' + process.env.PORT);
})