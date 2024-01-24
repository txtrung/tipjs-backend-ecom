'use strict';

const { unGetSelectData, getSelectData, convertToObjectIdMongoDb } = require("../../utils");
const discountModel = require("../discount.model");

const findAllDiscountCodeUnselect = async ({
    limit = 50, page = 1, sort = 'ctime', filter, unSelect, model
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {_id : -1} : {_id : 1};
    const discounts = await discountModel.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean();

    return discounts;
};

const findAllDiscountCodeSelect = async ({
    limit = 50, page = 1, sort = 'ctime', filter, select, model
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {_id : -1} : {_id : 1};
    const discounts = await discountModel.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

    return discounts;
};

const checkDiscountExist = async (filter,model=discountModel) => {
    return await discountModel.findOne(filter).lean();
};

const updateDiscount = async (codeId,schema) => {
    return await discountModel.findByIdAndUpdate(codeId,schema)
};

module.exports = {
    findAllDiscountCodeSelect,
    findAllDiscountCodeUnselect,
    checkDiscountExist,
    updateDiscount,
}