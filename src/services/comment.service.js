'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const commentModel = require('../models/comment.model');
const { findProduct } = require('../models/repositories/product.repo');
const { convertToObjectIdMongoDb } = require('../utils');

class CommentService {
    static async createComment({
        productId, userId, content, parentCommentId = null
    }) {
        const comment = new commentModel({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId
        });

        let rightValue;
        if (parentCommentId) {
            const parentComment = await commentModel.findById(parentCommentId);
            if (!parentComment) throw new BadRequestError('parent comment not found');

            rightValue = parentComment.comment_right;

            await commentModel.updateMany({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_right: { $gte: rightValue}
            },{
                $inc: { comment_right: 2}
            });

            await commentModel.updateMany({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_left: { $gt: rightValue}
            },{
                $inc: { comment_left: 2}
            });
        } else {
            const maxRightValue = await commentModel.findOne({
                comment_productId: convertToObjectIdMongoDb(productId)
            },
            'comment_right',
            {
                sort: {
                    comment_right: -1
                }
            });
            if (maxRightValue) {
                rightValue = maxRightValue.right + 1;
            } else {
                rightValue = 1;
            }
        }

        comment.comment_left = rightValue;
        comment.comment_right = rightValue + 1;

        comment.save();
        return comment;
    }

    static async getCommentsByParentId({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0
    }) {
        console.log(productId,parentCommentId);
        if (parentCommentId) {
            const parentComment = await commentModel.findById(parentCommentId);
            if (!parentComment) throw new BadRequestError('parent comment not found');

            const comments = await commentModel.find({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_left: { $gt: parentComment.comment_left },
                comment_right: { $lt: parentComment.comment_right }
            }).select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1
            }).sort({
                comment_left: 1
            });

            return comments;
        }

        const comment = await commentModel.find({
            comment_productId: convertToObjectIdMongoDb(productId),
            comment_parentId: convertToObjectIdMongoDb(parentCommentId)
        }).select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parentId: 1
        }).sort({
            comment_left: 1
        });

        return comment;
    }

    static async deleteComments({
        commentId,
        productId
    }) {
        const product = await findProduct({product_id: productId});
        if (!product) throw new NotFoundError('Product not found!!');

        const comment = await commentModel.findById(commentId);
        if (!comment) throw new NotFoundError('Comment not found!!');
        
        const left = comment.comment_left;
        const right = comment.comment_right;
        const totalComments = right - left + 1;

        await commentModel.deleteMany({
            comment_productId: convertToObjectIdMongoDb(productId),
            $or: [
                {
                    _id: convertToObjectIdMongoDb(commentId)
                },
                {
                    comment_parentId: convertToObjectIdMongoDb(commentId)
                }
            ]
        });

        await commentModel.updateMany({
            comment_productId: convertToObjectIdMongoDb(productId),
            comment_left: {
                $gt: right
            }
        },{
            $inc: { comment_left: -totalComments}
        });

        await commentModel.updateMany({
            comment_productId: convertToObjectIdMongoDb(productId),
            comment_right: {
                $gt: right
            }
        },{
            $inc: { comment_right: -totalComments}
        });

        return true;
    }
}

module.exports = CommentService;