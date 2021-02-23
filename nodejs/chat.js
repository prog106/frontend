const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const moment = require('moment');
moment.locale('ko');

require('dotenv').config();
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


app.use((req, res) => {
    return res.status(404).send('Page Not Found!')
});

/* app.get('/chat', function(req, res) {
    res.render('chat/chat.ejs');
});

app.get('/room', function(req, res) {
    res.render('chat/room.ejs');
}); */

server.listen(3000, function() {
    console.log('Socket IO port 3000');
});

/* // 채팅을 위한 명확한 URL 생성 - /chat
const chat = io.of('/chat');

// connection event handler
chat.on('connection', function(socket) {

    // 채팅 event 정보
    // join : 클라이언트 접속 - 닉네임 (nickname), 방이름 (roomname)
    // chat : 클라이언트 메시지 수신 - 메시지 (msg)
    // client-disconnect : 클라이언트 나가기
    socket.on('join', function(data) { // event : join - 채팅방 참여
        socket.nickname = data.nickname;
        // chat.emit('join', data.nickname); // 채팅방 전체 참여자에게 메시지 전송
        // socket.emit('join', data.nickname); // 자기 자신에게만 메시지 전송
        socket.broadcast.emit('join', data.nickname); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
        // chat.to(id).emit('join', data.nickname); // 특정 참여자에게 메시지 전송
    });

    socket.on('chat', function(data) { // event : chat - 채팅방에 메시지 전송
        let msg = {
            from: {
                nickname: socket.nickname
            },
            msg: data.msg
        }
        chat.emit('chat', msg); // 채팅방 전체 참여자에게 메시지 전송
        // socket.emit('chat', msg); // 자기 자신에게만 메시지 전송
        // socket.broadcast.emit('chat', msg); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
        // chat.to(id).emit('chat', msg); // 특정 참여자에게 메시지 전송
    });

    socket.on('client-disconnect', function() { // event : client-disconnect - 채팅방에서 나가기
        // chat.emit('client-disconnect', socket.nickname); // 채팅방 전체 참여자에게 메시지 전송
        // socket.emit('client-disconnect', socket.nickname); // 자기 자신에게만 메시지 전송
        socket.broadcast.emit('client-disconnect', socket.nickname); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
        // chat.to(id).emit('client-disconnect', socket.nickname); // 특정 참여자에게 메시지 전송
        socket.disconnect(); // 채팅방 나가기
    })

    socket.on('disconnect', function() { // 접속 끊어진 사용자 로그 남기기
        if(socket.nickname) console.log('disconnect : ' + socket.nickname);
    });

});
 */

// room 은 /chat 이라는 채팅안에 특정 방을 만든다는 개념. 헷갈림... 사용법을 좀 더 생각해 보자.
// 보던곳 : https://medium.com/wasd/node-js%EC%99%80-socket-io%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-%EC%B1%84%ED%8C%85-%EA%B5%AC%ED%98%84-3-cc1112d4262c

// namespace /chat에 ws로 접속한다.

// 여기에는 최대 3개의 room을 만들수 있다.
/* let rooms = [
    { code: 'A', name: 'Channel A', author: '홍길동', created_at: '2021-02-17' },
    { code: 'B', name: 'Channel B', author: '홍길동', created_at: '2021-02-18' },
    { code: 'C', name: 'Channel C', author: '홍길동', created_at: '2021-02-19' },
];
// let rooms = []; // 방 정보 - 방이름, 방장, 생성일시
let joins = []; // 참여 정보 - 방이름 : [ 참여자1, 참여자2 ]

function makeRandomName() { // 랜덤 3글자
    let name = "test";
    let possible = "abcdefghijklmnopqrstuvwxyz";
    for( let i = 0; i < 3; i++ ) {
        name += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return name;
} */

// let channels = [];
let users = []; // 참여자 목록 { user_idx: 1, user_name: '홍길동' }
let chat = io.of('/chat').on('connection', function(socket) {
    let user = socket.request.session;
    socket.on('ready', function(data) {
        if(!user.user_idx) {
            socket.emit('redirect', '로그인 후 이용해 주세요.');
            return false;
        }

        let findidx = users.findIndex((item) => item.user_idx === user.user_idx);
        if(findidx < 0) {
            users.push({ user_idx: user.user_idx, user_name: user.user_name });
        }

        let userlist = users.map(function(item) {
            return item.user_name;
        });
        chat.emit('hi', 'hi');
        chat.emit('userlist', userlist);
    });
    socket.on('chat', function(data) {
        let res = {
            author: user.user_name,
            msg: data.msg,
            time: moment().format('LT'), // 오후 2:48
        }
        chat.emit('chat', res);
    });
});


// let chat = io.of('/chat').on('connection', function(socket) {
    // 접속시 세션 확인 - 없으면 접속 불가
    // console.log(socket.request);
    /* socket.on('ready', function(data) { // 방 미선택 상태
        let msg = {
            'msg': '참여할 방을 선택하세요.',
            'rooms': rooms,
        }
        socket.emit('ready', msg); // 나에게만
    }); */
    /* socket.on('make', function(data) { // 방 만들기 > 방 참여 (join) > 전체 noti (ready)
        let code = makeRandomName();
        let name = data.name;
        let author = socket.author = data.author;
        rooms.push({ code: code, name: name, author: author, created_at: moment().format('YYYY-MM-DD hh:mm:ss') }); // 방이름 : 만든사람 : 생성일
        // let room = rooms.length - 1;
        let room = code;

        socket.join(code); // room 참여
        let res = {
            room: room,
            title: name,
            author: author,
        }
        socket.emit('join', res); // room 참여 noti

        let msg = {
            'rooms': rooms,
        }
        chat.emit('ready', msg); // 전체 noti
    }); */
    /* socket.on('channel-join', function(data) {
        let author = socket.author = data.author;
        let idx = rooms.findIndex((item) => item.code === data.room);
        let room = data.room;
        socket.join(room);
        let res = {
            room: room,
            title: rooms[idx].name,
            author: author,
        }
        chat.emit('channel-join', res);
    }); */
    /* socket.on('drop', function(data) {
        let idx = rooms.findIndex((item) => item.code === data.room);
        if(rooms[idx].author === data.author) {
            rooms.splice(data.room, 1);
            let msg = {
                'rooms': rooms,
            }
            chat.emit('ready', msg); // 전체
        } else {
            socket.emit('error', { msg: '방장이 아닙니다.' }); // 나에게만
        }
    }); */
    /* socket.on('join', function(data) {
        console.log('message from client: ', data);

        // 방을 만들고, 참여
        if(!rooms[data.room]) { // 없으면 만들기
            console.log(rooms);
            // if(rooms.length >= 3) { // 최대 3개
            //     socket.emit('error', '방을 더 이상 만들 수 없습니다.');
            //     return false;
            // }
            // rooms.push(data.room);
            // chat.to(room).emit('join', `${name} 님이 입장하였습니다.`);
            socket.disconnect();
            return false;
        }

        let name = socket.name = data.name;
        let room = socket.room = data.room;

        let res = {
            name: 'alert',
            msg: name + ' 님이 입장하였습니다.',
            time: moment().format('LT'), // 오후 2:48
        }
        // room에 join한다
        socket.join(room);
        // room에 join되어 있는 클라이언트에게 메시지를 전송한다
        chat.to(room).emit('join', res);
    }); */
    /* socket.on('tolobby', function(data) {
        socket.leave(data.room);
        let res = {
            name: 'alert',
            msg: data.name + ' 님이 퇴장하였습니다.',
            time: moment().format('LT'), // 오후 2:48
        }
        chat.to(data.room).emit('tolobby', res);
        let msg = {
            'msg': '참여할 방을 선택하세요.',
            'rooms': rooms,
        }
        chat.emit('ready', msg);
    }); */
    /* socket.on('disconnect', function(data) {
        console.log('disconnect');
        console.log(socket.id);
    }); */
    /* socket.on('chat', function(data) {
        let res = {
            author: socket.author,
            msg: data.msg,
            time: moment().format('LT'), // 오후 2:48
        }
        chat.to(data.room).emit('chat', res);
    }); */
// });
