const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();

// init middleware
app.use(morgan('dev')); // dev, combined, common, short, tiny
app.use(helmet());
app.use(compression());

// init db

// init routes
app.get('/', (req,res,next) => {
    const strCompress = 'Hello world!';
    return res.status(200).json({
        message: 'welcome',
        metadata: strCompress.repeat(1000000)
    })
})

// handle errors

module.exports = app