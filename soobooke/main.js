const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*'} });
const moment = require('moment');
moment.locale('ko');

require('dotenv').config({ path: __dirname + `/.env${process.env.NODE_ENV !== undefined ? '.live' : ''}`});

// 세션을 사용하지 않기로 결정
// const session = require('express-session');
/* const redisClient = require('./modules/common.js').redis();
redisClient.on('error', function(err) { console.log('Redis error: ' + err); });
const RedisStore = require('connect-redis')(session);
const sessionMiddleWare = session({ // session
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 300
    },
    store: new RedisStore({ client: redisClient, ttl: 60*60*24*7 }),
});
app.use(sessionMiddleWare); */

// const mysqlClient = require('./modules/common.js').db();
// const MySQLStore = require('express-mysql-session')(session);
// const sessionMiddleWare = session({
//     secret: '1234',
//     resave: false,
//     saveUninitialized: true,
//     store: new MySQLStore({ // 세션 저장 DB 정보
//         host: process.env.DB_HOST,
//         port: process.env.DB_PORT,
//         user: process.env.DB_USER,
//         password: process.env.DB_PWD,
//         database: process.env.DB_DATABASE,
//     }),
// }); // session
// app.use(sessionMiddleWare);

app.use(express.static('public'));

app.set('view engine', 'ejs'); // ejs template
app.set('views', './views');

app.use('/', require('./routes/index.js')(app));
app.use('/auth', require('./routes/auth.js')(app)); // 로그인
app.use('/user', require('./routes/user.js')(app)); // 회원정보
app.use('/bookshelf', require('./routes/bookshelf.js')(app)); // 책꽂이 정보
app.use('/book', require('./routes/book.js')(app)); // 책 정보
app.use('/search', require('./routes/search.js')(app)); // 책 검색

// io.of('/book').use(function(socket, next) {
//     sessionMiddleWare(socket.request, socket.request.res, next);
// });
// require('./routes/book.js')(io);

app.use((req, res) => {
    return res.status(404).send('Page Not Found!')
});

server.listen(3000, function() {
    console.log('Socket IO port 3000');
});
