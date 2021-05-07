const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*'} });
const moment = require('moment');
moment.locale('ko');

require('dotenv').config({ path: __dirname + `/.env${process.env.NODE_ENV !== undefined ? '.live' : ''}`});

const session = require('express-session');
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
/*
로그인 유지 정책
- 기본적으로 세션을 사용하여 로그인을 유지한다.
- 세션이 없을 경우 localStorage.uid 를 확인한다.
- localStorage.uid 가 있을 경우 /member 페이지로 이동한다.
- localStorage.uid 가 없을 경우 /login 페이지로 이동한다.
- /login 페이지에서 localStorage.uid 가 있을경우 회원정보를 체크후 정상일 경우 /member 페이지로 이동한다.
- 로그인 안된 상태에서 로그인이 필요한 페이지 접속시, localStorage.uid 가 있을 경우 /member 로, 없을 경우 /login 으로 이동한다.
- 로그인 안된 상태에서 로그인이 선택인 페이지 접속시, localStorage.uid 가 있을 경우 /member 로, 없을 경우 /login 으로 이동한다.
- /member 페이지에서 정상적인 localStorage.uid 가 아닐 경우 /logout 으로 이동한다.
*/
const MySQLStore = require('express-mysql-session')(session);
const sessionMiddleWare = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({ // 세션 저장 DB 정보
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_DATABASE,
    }),
}); // session
app.use(sessionMiddleWare);

const cookieParser = require('cookie-parser');
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 암호화

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
