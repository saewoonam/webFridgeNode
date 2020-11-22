// routes/plot.json.js
const sqlite3 = require('better-sqlite3');
// let db = new sqlite3('./db/fridge_data.db');
let db = new sqlite3('../../node-fridge-logger/fridge_data.db');
// console.log(db)
// let select = db.prepare('SELECT Time, _1k FROM fridge;')
// let stuff = select.all()
// console.log('stuff length', stuff.length, stuff[0]);
import redis from 'redis';
const { REDIS_SERVER } = process.env;

let redis_server = REDIS_SERVER
if (typeof(redis_server) == 'undefined') {
    redis_server = 'localhost'
} else {
    redis_server = REDIS_SERVER;
}

let redis_client = redis.createClient(6379, redis_server);
// console.log(redis_client)
export function get(req, res, next) {
    redis_client.lrange('plot_keys', 0, -1, function(err, reply) {
        let plot_keys = reply;
        // console.log('plot_keys', plot_keys);
        // adjust key names to sqlite column names
        let keys = plot_keys.map(item => { 
            item = /^\d/.test(item) ? '_'+item : item;
            item = item.replace(/ /g, '_');
            return item; 
        });
        let all = [];
        let table_col_names = db.pragma('table_info(fridge)').map(item=>item.name)
        // console.log('table_info', table_col_names);
        for (const key of keys) {
            let stuff = [];
            let select = `SELECT ${key} FROM fridge;`
            // console.log('select cmd: ', select);
            select = db.prepare(select);
            select.raw()
            stuff = select.all()
            stuff = [].concat(...stuff)
            // console.log(stuff[0]);
            all.push(stuff)
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(all));
    });
}
