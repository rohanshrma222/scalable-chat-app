import prismaClient from "@repo/db/client";
import { Redis } from "ioredis";
import {Server} from "socket.io";
import { produceMessage } from "./kafka";

const redisUrl = process.env.UPSTASH_REDIS_URL;
if (!redisUrl) throw new Error("UPSTASH_REDIS_URL is not set");

const pub = new Redis(redisUrl);
const sub = new Redis(redisUrl);
 
class SocketService {
    private _io: Server;

    constructor(){
        console.log("Init Socket Service...");
        this._io = new Server({
            cors: {
                allowedHeaders: ['*'],
                origin: '*'
            }
        });
        sub.subscribe('MESSAGES');
    }

    public initListeners(){
        const io = this.io;
        io.on("connect",(socket) =>{
            console.log(`New Socket Connection`, socket.id); 
            socket.on("event:message", async ({message}: {message: string}) =>{
                console.log("New Message Rec.", message);
                // publish the message to redis
                await pub.publish('MESSAGES', JSON.stringify({ message }))
            });
        });   

        sub.on('message', async(channel , message ) => {
            if(channel === "MESSAGES"){
                console.log("new message from redis", message)
                io.emit("message", message);
                 await produceMessage(message);
                 console.log("Message Produced to KafKa Broker")
                // await prismaClient.messages.create({
                //     data:{
                //         text: message,
                //     }
                // })
            }
        })
    }

    get io(){
        return this._io;
    }
}

export default SocketService;