'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async ({name, email, password}) => {
        try {
            const holderShop = await shopModel.findOne({email}).lean();
            console.log(holderShop);
            if (holderShop) {
                return {
                    code: 'yyy',
                    message: 'Shop already registered!'
                }
            }

            const hashPassword = await bcrypt.hash(password, 10);
            const newHolderShop = await shopModel.create({name, email, password: hashPassword, roles: [RoleShop.SHOP]})
            if (newHolderShop) {
                // generate private-public key
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                });
                console.log({ privateKey, publicKey });
                
                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newHolderShop._id,
                    publicKey
                })

                if (!publicKeyString) {
                    return {
                        code: 'zzzz',
                        message: 'public key string error!'
                    }
                }

                console.log('publicKeyString: ',publicKeyString);
                const publicKeyObject = crypto.createPublicKey(publicKeyString);
                console.log('publicKeyObject: ',publicKeyObject);

                const tokens = await createTokenPair({userId: newHolderShop._id, email}, publicKeyObject, privateKey);
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
        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    } 
}

module.exports = AccessService;