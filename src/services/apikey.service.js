'use strict';

const crypto = require('crypto');
const apikeyModel = require('../models/apikey.model');

const findById = async (key) => {
    // const newApiKey = await apikeyModel.create({key: crypto.randomBytes(64).toString('hex'),permissions: ['0000']});
    // console.log('newApiKey: ',newApiKey);
    const objKey = await apikeyModel.findOne({key, status: true}).lean();
    return objKey;
};

module.exports = {
    findById,
}