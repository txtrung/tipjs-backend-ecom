'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static logout = async (keyStore) => {
        console.log('keyStore._id: ',keyStore._id);
        return await KeyTokenService.removeById(keyStore._id);
    }

    /*
        1 - check email
        2 - check password
        3 - create access token and refresh token and save
        4 - generate tokens
        5 - get data return login
    */
    static login = async ({email, password, refreshToken = {}}) => {
        const foundShop = await findByEmail({email});
        if (!foundShop) {
            throw new BadRequestError('Shop not registered!');
        }

        const matchPassword = bcrypt.compare(password, foundShop.password);
        if (!matchPassword) {
            throw new AuthFailureError('Authentication error!');
        }

        const publicKey = crypto.randomBytes(64).toString('hex');
        const privateKey = crypto.randomBytes(64).toString('hex');
        const tokens = await createTokenPair({userId: foundShop._id, email}, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            publicKey,
            privateKey,
            refreshToken: tokens?.refreshToken
        })

        return {
            shop: getInfoData({fields: ['_id','name','email'], object:foundShop}),
            tokens
        }
    };

    static signUp = async ({name, email, password}) => {

            const holderShop = await shopModel.findOne({email}).lean();
            if (holderShop) {
                throw new BadRequestError('Error: Shop already registered!')
            }

            const hashPassword = await bcrypt.hash(password, 10);
            const newHolderShop = await shopModel.create({name, email, password: hashPassword, roles: [RoleShop.SHOP]})
            if (newHolderShop) {
                
                const publicKey = crypto.randomBytes(64).toString('hex');
                const privateKey = crypto.randomBytes(64).toString('hex');
                

                const tokens = await createTokenPair({userId: newHolderShop._id, email}, publicKey, privateKey);

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newHolderShop._id,
                    publicKey,
                    privateKey,
                    refreshToken: tokens?.refreshToken
                })

                if (!keyStore) {
                    return {
                        code: 'zzzz',
                        message: 'keyStore error!'
                    }
                }

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