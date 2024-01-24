'use strict';

const _ = require('lodash');
const { Types } = require('mongoose');

const convertToObjectIdMongoDb = id => new Types.ObjectId(id);

const getInfoData = ({
    fields = [],
    object = {}
}) => {
    return _.pick(object,fields);
};

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(sl=>[sl,1]));
};

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(sl=>[sl,0]));
};

const removeUndefinedObject = obj => {
    Object.keys(obj).forEach(k => {
        if (!obj[k]) {
            delete obj[k];
        }
    });
    return obj;
};

const updateNestedObjectParse = obj => {
    const final = {};
    Object.keys(obj).forEach( k => {
        if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            const lowestNested = updateNestedObjectParse(obj[k]);
            Object.keys(lowestNested).forEach( d => {
                final[`${k}.${d}`] = lowestNested[d]; 
            })
        } else {
            final[k] = obj[k];
        }
    });
    return final;
}

module.exports = {
    convertToObjectIdMongoDb,
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParse,
};