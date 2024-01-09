'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../core/error.response");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async ({name, email, password}) => {
a
            const holderShop = await shopModel.findOne({email}).lean();
            if (holderShop) {
                throw new BadRequestError('Error: Shop already registered!')
            }

            const hashPassword = await bcrypt.hash(password, 10);
            const newHolderShop = await shopModel.create({name, email, password: hashPassword, roles: [RoleShop.SHOP]})
            if (newHolderShop) {
                
                const publicKey = crypto.randomBytes(64).toString('hex');
                const privateKey = crypto.randomBytes(64).toString('hex');
                
                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newHolderShop._id,
                    publicKey,
                    privateKey
                })

                if (!keyStore) {
                    return {
                        code: 'zzzz',
                        message: 'keyStore error!'
                    }
                }

                const tokens = await createTokenPair({userId: newHolderShop._id, email}, publicKey, privateKey);
                console.log('create access tokens success!', tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields: ['_id','name','email'],object:newHolderShop}),
                        tokens
                    }
                }
            }

            return {
                code: 200,
                metadata: null
            }
    } 
}

module.exports = AccessService;