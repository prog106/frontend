const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const moment = require('moment');
moment.locale('ko');

require('dotenv').config({ path: __dirname + `/.env${process.env.NODE_ENV !== undefined ? '.live' : ''}`});
const session = require('express-session');

const redisClient = require('./modules/common.js').redis();
redisClient.on('error', function(err) { console.log('Redis error: ' + err); });
const RedisStore = require('connect-redis')(session);
/* app.use(session({ // session
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    },
    store: new RedisStore({ client: redisClient, ttl: 60*30 }),
})); */


const sessionMiddleWare = session({ // session
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    },
    store: new RedisStore({ client: redisClient, ttl: 60*30 }),
});

app.use(sessionMiddleWare);

io.of('/chat').use(function(socket, next) {
    sessionMiddleWare(socket.request, socket.request.res, next);
});

app.use(express.static('public'));

app.set('view engine', 'ejs'); // ejs template
app.set('views', './views');

app.use('/', require('./routes/index.js')());
app.use('/forms', require('./routes/forms.js')());
app.use('/user', require('./routes/user.js')());
app.use('/ax', require('./routes/ax.js')());

// /io Socket.io - 기본
require('./modules/io.js')(io);

// /chat Socket.io - namespace & room 적용
require('./modules/chat.js')(io);

app.use((req, res) => {
    return res.status(404).send('Page Not Found!')
});

server.listen(3000, function() {
    console.log('Socket IO port 3000');
});
