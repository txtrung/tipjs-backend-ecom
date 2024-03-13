'use strict';

const notificationModel = require("../models/notification.model");

const pushNotiToSystem = async ({
    type = 'SHOP-001',
    senderId = 1,
    receiverId = 1,
    options = {}
}) => {
    let noti_content = '';
    if (type === 'SHOP-001') {
        noti_content = `@@@ vua moi them 1 san pham: @@@`;
    } else if (type === 'PROMOTION-001') {
        noti_content = `@@@ vua moi them 1 voucher: @@@`;
    }

    const newNoti = notificationModel.create({
        noti_content: noti_content,
        noti_options: options,
        noti_receiverId: receiverId,
        noti_senderId: senderId,
        noti_type: type
    });

    return newNoti;
};

const listNotiByUser = async ({
    userId = 1,
    type = 'ALL',
    isRead = 0
}) => {
    const match = {
        noti_receiverId: userId
    };
    
    if (type !== 'ALL') {
        match['noti_type'] = type;
    }

    return await notificationModel.aggregate([{
        $match: match
    },{
        $project: {
            noti_type: 1,
            noti_senderId: 1,
            noti_receiverId: 1,
            noti_content: 1,
            createdAt: 1
        }
    }]);
};

module.exports = {
    pushNotiToSystem,
    listNotiByUser,
}