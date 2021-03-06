const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*'} });
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
        maxAge: 1000 * 60 * 300
    },
    store: new RedisStore({ client: redisClient, ttl: 60*300 }),
});

app.use(sessionMiddleWare);

app.use(express.static('public'));

app.set('view engine', 'ejs'); // ejs template
app.set('views', './views');

app.use('/', require('./routes/index.js')(app));
app.use('/user', require('./routes/chat/user.js')(app)); // 회원 정보 with 로그인
app.use('/auth', require('./routes/chat/auth.js')(app));
app.use('/verify', require('./routes/chat/verify.js')(app)); // access_token
app.use('/receipt', require('./routes/chat/receipt.js')(app)); // 영수증 검증
app.use('/game', require('./routes/game.js')(app));
// app.use('/forms', require('./routes/forms.js')());
// app.use('/ax', require('./routes/ax.js')());
// app.use('/social', require('./routes/social.js')(app));

io.of('/single').use(function(socket, next) {
    sessionMiddleWare(socket.request, socket.request.res, next);
});
io.of('/chat').use(function(socket, next) {
    sessionMiddleWare(socket.request, socket.request.res, next);
});
io.of('/lotto').use(function(socket, next) {
    sessionMiddleWare(socket.request, socket.request.res, next);
});
io.of('/minesweeper').use(function(socket, next) {
    sessionMiddleWare(socket.request, socket.request.res, next);
});
// io.of('/jasstone').use(function(socket, next) {
//     sessionMiddleWare(socket.request, socket.request.res, next);
// });
io.of('/cardroyal').use(function(socket, next) {
    sessionMiddleWare(socket.request, socket.request.res, next);
});
io.of('/cardbattle').use(function(socket, next) {
    sessionMiddleWare(socket.request, socket.request.res, next);
});
io.of('/star').use(function(socket, next) {
    sessionMiddleWare(socket.request, socket.request.res, next);
});

// Socket.io - 기본
require('./routes/single.js')(io);
// /chat Socket.io - namespace & room 적용
require('./routes/chat.js')(io);
// Socket.io - lotto
require('./routes/game/lotto.js')(io);
// Socket.io - minesweeper
require('./routes/game/minesweeper.js')(io);
// Socket.io - jasstone
// require('./routes/game/jasstone.js')(io);
// Socket.io - cardroyal
require('./routes/game/cardroyal.js')(io);
// Socket.io - cardbattle
require('./routes/game/cardbattle.js')(io);
// Socket.io - star
require('./routes/game/star.js')(io);

app.use((req, res) => {
    return res.status(404).send('Page Not Found!')
});

server.listen(3000, function() {
    console.log('Socket IO port 3000');
});
