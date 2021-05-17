const express = require('express');
const app = express();
app.disable('x-powered-by');
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

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true})); // post, put
app.use(bodyParser.json());

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session()); // passport

const flash = require('connect-flash');
app.use(flash()); // flash

app.use(express.static('public'));

app.set('view engine', 'ejs'); // ejs template
app.set('views', './views');

// 규칙
// - url, ax 로 구성
// url 은 모두 get 방식으로 구성
// ax 는 CRUD get , post , put , delete
// /user 인 url 에서는 /user/ax_* 를 호출
// app.use('/user', require('./routes/user.js')(app));
// 로그인은 암호화된 쿠키를 사용하여 유지하며, expired 는 1개월 정도로 설정. 갱신은 없음. 1개월 후 재 로그인 필요.
// 사용자 전환하면 다시 1개월로
// 사이트맵
/*
- 메인 /main /[get]main
- 로그인 /login
- 카카오 로그인 /login/kakao , /login/kakao/success , /login/kakao/failure
- 사용자 선택 /choose
- 로그아웃 /logout
- 회원탈퇴 /user/out
- 내정보 /user/info , /user/ax_update
- 사용자 관리 /user/manage , /user/ax_get_list , /user/ax_save , /user/ax_delete
- 사용자 바꾸기 /user/choose , /user/ax_get_list , /user/ax_choose
- 책편지함 /bookletter
- 내책장 /bookshelf
- 책꽂이 관리 /shelf
- 채널 /channel
- 책검색 /search/ax_book
- 책꽂이검색 /search/ax_shelf
- 채널검색 /search/ax_channel

- ax 목록 : ax_get , ax_get_list , ax_save , ax_update , ax_delete , 

*/




app.use('/', require('./routes/main.js')(app));
// app.use('/', require('./routes/index.js')(app));
app.use('/auth', require('./routes/auth.js')(app)); // 로그인
app.use('/user', require('./routes/user.js')(app)); // 회원정보
app.use('/bookshelf', require('./routes/bookshelf.js')(app)); // 우리 가족 책장 정보
app.use('/myshelf', require('./routes/myshelf.js')(app)); // 내 책꽂이 정보
app.use('/bookstamp', require('./routes/bookstamp.js')(app)); // 우리 아이 도장 찍어주기
// app.use('/book', require('./routes/book.js')(app)); // 책 정보
app.use('/search', require('./routes/search.js')(app)); // 책 검색
app.use('/history', require('./routes/history.js')(app)); // history

// io.of('/book').use(function(socket, next) {
//     sessionMiddleWare(socket.request, socket.request.res, next);
// });
// require('./routes/book.js')(io);

app.use((req, res) => {
    // return res.status(404).send('Page Not Found!');
    return res.status(404).render('404.ejs');
});

server.listen(3000, function() {
    console.log('Socket IO port 3000');
});
