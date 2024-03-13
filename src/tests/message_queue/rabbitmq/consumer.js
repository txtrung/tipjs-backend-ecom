const amqp = require('amqplib');
const { trusted } = require('mongoose');

const runConsumer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost');
        const channel = await connection.createChannel();

        const queueName = 'test-topic';
        await channel.assertQueue(queueName,{
            durable: true
        })

        channel.consume(queueName, (message) => {
            console.log(message?.content.toString());
        },{
            noAck: trusted
        });
    } catch (error) {
        console.log(error);
    }
}

runConsumer().catch(console.error);