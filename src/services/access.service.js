'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    static handleRefreshTokenV2 = async ({refreshToken, user, keyStore}) => {
        const { userId, email} = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.removeByUserId(userId);
            throw new ForbiddenError('Something went wrong, please login again!!');
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('Shop refreshToken is not found!');
        }

        const holderShop = await findByEmail({email});
        if (!holderShop) {
            throw new AuthFailureError('Shop is not registered!');
        }

        const newToken = await createTokenPair({ userId, email}, keyStore.publicKey, keyStore.privateKey);
        await keyStore.updateOne({
            $set: {
                refreshToken: newToken?.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user,
            newToken
        }
    };

    static handleRefreshToken = async (refreshToken) => {
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
        if (foundToken) {
            const {userId, email} = await verifyJWT(refreshToken,foundToken.privateKey);
            console.log('refresh token used: ', {userId, email});
            await KeyTokenService.removeByUserId(userId);
            throw new ForbiddenError('Something went wrong, please login again!!');
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) {
            throw new AuthFailureError('Shop refreshToken is not found!');
        }

        const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey);
        console.log('refresh token: ', {userId, email});

        const holderShop = await findByEmail({email});
        if (!holderShop) {
            throw new AuthFailureError('Shop is not registered!');
        }

        const newToken = await createTokenPair({userId: holderShop._id, email}, holderToken.publicKey, holderToken.privateKey);
        await holderToken.updateOne({
            $set: {
                refreshToken: newToken?.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user: {userId, email},
            newToken
        }
    };

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