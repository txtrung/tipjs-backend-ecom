const redis = require('redis');

class RedisPubSubService {
    constructor() {
        this.subscriber = redis.createClient();
        this.subscriber.connect();

        this.publisher = redis.createClient();
        this.publisher.connect();
    }

    publish(channel, message) {
        return new Promise((resolve,reject) => {
            this.publisher.publish(channel, message, (error, reply) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(reply);
                }
            })
        })
    }

    subscribe(channel, callback) {
        this.subscriber.subscribe(channel, (message, subscriberChannel) => {
            if (channel === subscriberChannel) {
                callback(channel, message);
            }
        });
    }
};

module.exports = new RedisPubSubService();