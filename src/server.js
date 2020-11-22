import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import http from 'http';
import io from 'socket.io';
import redis from 'redis';
import yaml from 'js-yaml';
import fs from 'fs';

const { PORT, NODE_ENV, REDIS_SERVER } = process.env;
const dev = NODE_ENV === 'development';

const server = http.createServer();
let redis_server = REDIS_SERVER
if (typeof(redis_server) == 'undefined') {
    redis_server = 'localhost'
} else {
    redis_server = REDIS_SERVER;
}

let redis_client = redis.createClient(6379, redis_server);
let publisher = redis.createClient(6379, redis_server);
let subscriber = redis.createClient(6379, redis_server); // seems to need a client for each task

function store_key_list(client, name, keys) {
    // Use this to store lists in redis database
    client.del(name)
    for (const key of keys) {
        client.rpush(name, key)
    }
}

/*
const keys = ['Time', '1k', '4k', '40k', 'pump', 'switch'];
store_key_list(redis_client, 'plot_keys', keys)

const keys = ['1k', '4k', '40k', 'pump', 'switch', 'hp', 'hs', 'relays'];
store_key_list(redis_client, 'table_keys', keys)
*/
// write config ... first time not needed anymore
/*
redis_client.lrange('plot_keys', 0, -1, function(err, reply) {
    let y = {'plot_keys':reply}
    // console.log(yaml.safeDump(y))
    fs.appendFileSync('./web_view_config.yaml',yaml.safeDump(y))
})

redis_client.lrange('table_keys', 0, -1, function(err, reply) {
    let y = {'table_keys':reply}
    fs.appendFileSync('./web_view_config.yaml',yaml.safeDump(y))
    // console.log(yaml.safeDump(y))
})
*/
let yaml_filename = './web_view_config.yaml';
let config = yaml.safeLoad(fs.readFileSync(yaml_filename))
console.log(config)
for (const key in config) {
    store_key_list(redis_client, key, config[key])
}

subscriber.on("message", function (channel, message) {
    // console.log("Message: " + message + " on channel: " + channel + " has arrived!");
    if (channel=="notifications") {
        socket_list.forEach(socket => socket.emit('message', "Message server sub"))
        let temp = [Date.now()/1000]
        for (let i=1; i<4; i++) {
            temp.push(100*Math.random());
        }
        socket_list.forEach(socket => socket.emit('temp_data', temp))
    } else if (channel == "temperatures") {
        let temperatures = JSON.parse(message)
        socket_list.forEach(socket => socket.emit('temp_data', temperatures))
    }
});

subscriber.subscribe("notification");
subscriber.subscribe("temperatures");


// console.log(PORT, NODE_ENV, REDIS_SERVER);
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
let socket_list = [];

io(server).on('connection', function(socket) {
    ++numUsers;
    socket_list.push(socket);
    console.log("Got connection, numUsers", numUsers, socket_list.length);
    let message = 'Server: A new user has joined the chat';
    socket.emit('message', 'connected: '+numUsers);
    // socket.broadcast.emit('user joined', { message, numUsers });
    //
    // socket.on('message', function(msg) {
    //     socket.broadcast.emit('message', msg);
    // })
    redis_client.lrange('plot_keys', 0, -1, function(err, reply) {
        let plot_keys = reply;
        socket.emit('plot_keys', plot_keys);
    })
    redis_client.lrange('table_keys', 0, -1, function(err, reply) {
        let table_keys = reply;
        socket.emit('table_keys', table_keys);
    })
    socket.on('button', function(msg) {
        console.log('button msg: ', msg)
        socket.broadcast.emit('button', msg);
    })
    socket.on('mode', function(msg) {
        console.log('mode msg: ', msg)
        socket.broadcast.emit('mode', msg);
        publisher.publish("fridge_state",
            msg,
            function(){ console.log("published fridge state"); }
        );
        // redis_client.set("mode", msg, redis.print);
        redis_client.set("mode", msg);
        redis_client.get("mode", function (err, reply) {
            if (err) {
                console.log(err);
                // throw err;
            }
            console.log('get mode after set', reply.toString());
        });
    })
    socket.on('disconnect', function() {
        --numUsers;
        let index = socket_list.indexOf(socket);
        if (index > -1) {
          socket_list.splice(index, 1);
        }
        console.log('someone disconnected, numUsers:', numUsers, socket_list.length);
    })

    // socket.on('user disconnect', function(name) {
    //     socket.broadcast.emit('message', `Server: ${name} has left the chat.`)
    // })
    // console.log(socket);

    // setInterval(function(){ 
    //     // console.log("emit interval message");
    //     let temp = [Date.now()/1000]
    //     for (let i=1; i<4; i++) {
    //         temp.push(100*Math.random());
    //     }
    //     if(numUsers>0) socket.emit('temp_data', temp);
    // }, 3000);
});



