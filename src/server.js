import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import http from 'http';
import io from 'socket.io';
import redis from 'redis';


const { PORT, NODE_ENV, REDIS_SERVER } = process.env;
const dev = NODE_ENV === 'development';

const server = http.createServer();
let redis_server = REDIS_SERVER
if (typeof(redis_server) == 'undefined') {
    redis_server = 'localhost'
} else {
    redis_server = REDIS_SERVER;
}
let subscriber = redis.createClient(6379, redis_server);
subscriber.on("message", function (channel, message) {
 console.log("Message: " + message + " on channel: " + channel + " has arrived!");
});

subscriber.subscribe("notification");

let redis_client = redis.createClient(6379, redis_server);
let publisher = redis.createClient(6379, redis_server);

console.log(PORT, NODE_ENV, REDIS_SERVER);
polka({ server }) // You can also use Express
    .use(
        compression({ threshold: 0 }),
        sirv('static', { dev }),
        sapper.middleware()
    )
    .listen(PORT, err => {
        if (err) console.log('error', err);
    });

let numUsers = 0;

io(server).on('connection', function(socket) {
    ++numUsers;
    let message = 'Server: A new user has joined the chat';
    socket.emit('message', 'connected: '+numUsers);
    // socket.broadcast.emit('user joined', { message, numUsers });
    //
    // socket.on('message', function(msg) {
    //     socket.broadcast.emit('message', msg);
    // })

    socket.on('button', function(msg) {
        console.log('button msg: ', msg)
        socket.broadcast.emit('button', msg);
    })
    socket.on('mode', function(msg) {
        console.log('mode msg: ', msg)
        publisher.publish("fridge_state",
            msg,
            function(){ console.log("puublished"); }
        );
        redis_client.set("mode", msg, redis.print);
        redis_client.get("mode", function (err, reply) {
            if (err) {
                console.log(err);
                // throw err;
            }
            console.log(reply.toString());
        });
    })
    socket.on('disconnect', function() {
        --numUsers;
        // socket.broadcast.emit('user left', numUsers);
    })

    // socket.on('user disconnect', function(name) {
    //     socket.broadcast.emit('message', `Server: ${name} has left the chat.`)
    // })
    // console.log(socket);
    setInterval(function(){ 
        // console.log("emit interval message");
        let temp = [Date.now()/1000]
        for (let i=1; i<4; i++) {
            temp.push(100*Math.random());
        }
        if(numUsers>0) socket.emit('temp_data', temp);
    }, 3000);
});



