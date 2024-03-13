'use strict';

const { SuccessResponse } = require("../core/success.response");
const NotificationService = require("../services/notification.service");

class CommentController {
    listNotiByUser = async (req,res,next) => {
        new SuccessResponse({
            message: 'listNotiByUser success!!',
            metadata: await NotificationService.listNotiByUser(req.body)
        }).send(res);    
    };
};

module.exports = new CommentController();