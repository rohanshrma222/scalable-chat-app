import prismaClient from '@repo/db/client';
import {Kafka, type Producer} from 'kafkajs'

const kafka = new Kafka({
    clientId:'chat-app',
    brokers: ['192.168.1.9:9092 ']
});

let producer: null | Producer = null;

export async function createProducer() {
    if (producer) return producer;

    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message: string){
    const producer = await createProducer();
    producer.send({
        messages: [{key : `message-${Date.now()}`, value: message }],
        topic: "MESSAGES",
    });
    return true;
}

export async function startMessageConsumer(){
    console.log("Consumer is running")
    const consumer = kafka.consumer({ groupId: "default"});
    await consumer.connect();
    await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({message, pause}) => {
            console.log(`New Message Received..`)
            if(!message.value) return
            try {
                await prismaClient.messages.create({
                    data:{
                        text: message.value?.toString(),
                    },
                });
            } catch (err){
                console.log('Something is wrong')
                pause()
                setTimeout(() => {
                    consumer.resume([{topic: "MESSAGES" }])
                }, 60 * 1000)
            } 
        }
    })
}


export default kafka;