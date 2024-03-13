const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();

// init middleware
app.use(morgan('dev')); // dev, combined, common, short, tiny
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))

// test redis pub.sub
// require('./tests/inventory.test');
// const product = require('./tests/product.test');
// product.purchaseProduct('product::19',10);

// init db
require('./dbs/init.mongodb');

// init routes
app.use('/', require('./routes'));

// handle errors
app.use((req,res,next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});
app.use((error,req,res,next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal server error'
    });
});

module.exports = app