'use strict';

const JWT = require('jsonwebtoken');
const { asyncHandle } = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    CLIENT_ID: 'x-client-id',
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rftoken-id'
} 

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload,publicKey,{
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign(payload,privateKey,{
            expiresIn: '7 days'
        })

        JWT.verify(accessToken,publicKey,(err, decode) => {
            if (err) {
                console.error('error verify: ', err);
            } else {
                console.log('decode verify: ', decode);
            }
        })

        return {accessToken,refreshToken};

    } catch (error) {
        
    }
};

const authentication = asyncHandle ( async (req, res, next) => {
    /*
        1 - Check userId
        2 - verify accessToken
        3 - check user
        4 - check keystore align with this user
        5 - return next()
    */

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) {
        throw new AuthFailureError('Invalid request!');
    }

    const keyStore = await findByUserId(userId);
    if (!keyStore) {
        throw new NotFoundError('Not found keyStore!');
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) {
        throw new AuthFailureError('Invalid request!');
    }

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError('Invalid user!');
        }
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

const authenticationV2 = asyncHandle ( async (req, res, next) => {

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) {
        throw new AuthFailureError('Invalid request!');
    }

    const keyStore = await findByUserId(userId);
    if (!keyStore) {
        throw new NotFoundError('Not found keyStore!');
    }

    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN];
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
            if (userId !== decodeUser.userId) {
                throw new AuthFailureError('Invalid user!');
            }
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            throw error;
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) {
        throw new AuthFailureError('Invalid request!');
    }

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError('Invalid user!');
        }
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

const verifyJWT = async (token, keySecret) => {
    return JWT.verify(token, keySecret);
};

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2,
}