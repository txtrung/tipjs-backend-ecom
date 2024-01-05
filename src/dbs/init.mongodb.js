'use strict';

const mongoose = require('mongoose');
const { countConnect } = require('../helpers/check.connect');
const {database:{host,port,name}} = require('../configs/config.mongodb');
const connectString = `mongodb://${host}:${port}/${name}`;
console.log(connectString);

class Database {
    constructor() {
        this.connect();
    }

    connect(type = 'mongodb') {
        if(1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', {color:true});
        }
        mongoose.connect(connectString)
            .then( _ => console.log('Connected MongoDb Success in a properly way!', countConnect()))
            .catch( err => console.log('Error connect!'));
    }

    static getInstance() {
        if(!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongoDB = Database.getInstance();
module.exports = instanceMongoDB;