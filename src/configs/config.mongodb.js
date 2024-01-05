const dev = {
    app: {
        port: process.env.DEV_APP_PORT,
    },
    database: {
        host: process.env.DEV_DB_HOST || 'localhost',
        port: process.env.DEV_DB_PORT || 27017,
        name: process.env.DEV_DB_NAME || 'shopDev',
    }
};

const production = {
    app: {
        port: process.env.PRO_APP_PORT,
    },
    database: {
        host: process.env.PRO_DB_HOST || 'localhost',
        port: process.env.PRO_DB_HOST || 27017,
        name: process.env.PRO_DB_HOST || 'shopProduct'
    }
};

const config = {
    dev,
    production,
}
const env = process.env.NODE_ENV || 'dev';
module.exports = config[env];