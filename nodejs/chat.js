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

function makeRandomName() { // 랜덤 3글자
    let name = '';
    let possible = "abcdefghijklmnopqrstuvwxyz";
    for( let i = 0; i < 3; i++ ) {
        name += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return name;
}

// 생성된 채널 정보와 채널 참여자 정보
let channels = [
    {
        'channel': 'channel1',
        'title': '채널 제목1',
        'created_at': '2021-02-21 12:31:21',
        'users': [
            // { user_idx, user_name, socket_id },
            // { user_idx, user_name, socket_id },
        ],
    },
    {
        'channel': 'channel2',
        'title': '채널 제목2',
        'created_at': '2021-02-24 18:23:24',
        'users': [
            // { user_idx, user_name, socket_id },
            // { user_idx, user_name, socket_id },
        ],
    },
];
// let channels = [];
// 접속자 정보
// [
//     { user_idx, user_name, socket_id, channel },
//     { user_idx, user_name, socket_id, channel },
// ]
let users = []; // 참여자 목록 { user_idx: 1, user_name: '홍길동', socket_id: 'ABC123', channel: 'channel1' }

let chat = io.of('/chat').on('connection', function(socket) {
    let user = socket.request.session;
    // 참여자 접속
    socket.on('ready', function(data) {
        if(!user.user_idx) {
            socket.emit('redirect', '로그인 후 이용해 주세요.');
            return false;
        }

        // 접속자 정보 업데이트
        let findUserIdx = users.findIndex((item) => item.user_idx === user.user_idx);
        if(findUserIdx < 0) {
            users.push({ user_idx: user.user_idx, user_name: user.user_name, socket_id: socket.id, channel: '' });
            chat.emit('user_list', users);
        } else {
            // 중복 접속 튕기기
            let socket_id = users[findUserIdx].socket_id;
            socket.emit('redirect', '중복 접속이 확인되었습니다. 다시 접속해 주세요.');
            // 먼저 접속한 사람 튕기기
            chat.to(socket_id).emit('redirect');
        }

        // 채널 정보 업데이트
        chat.emit('channel_list', channels);
    });
    // 참여자 채널 만들기 & 접속
    socket.on('channel', function(data) {
        let title = data.title;
        let socket_id = socket.id;
        let channel = moment().format('YYYYMMDDHHmmss') + makeRandomName();

        channels.push({
            'channel': channel,
            'title': title,
            'created_at': moment().format('YYYY-MM-DD HH:mm:ss'),
            'users': [
                { user_idx: user.user_idx, user_name: user.user_name, socket_id: socket_id }
            ]
        });
        let findUserIdx = users.findIndex((item) => item.user_idx === user.user_idx);
        if(findUserIdx < 0) {
            socket.emit('reload');
            return false;
        }
        users[findUserIdx].channel = channel;

        socket.join(channel); // 채널 접속
        chat.emit('channel_list', channels);
        chat.emit('user_list', users);
        chat.to(channel).emit('join', { // 나에게 or 전체.
            channel: channel,
            title: title,
            msg: user.user_name + ' 님이 입장하였습니다!',
        });
        let findChannelIdx = channels.findIndex((item) => item.channel === channel);
        chat.to(channel).emit('join_list', channels[findChannelIdx].users);
    });
    // 참여자 채널 접속
    socket.on('channel-join', function(data) {
        let channel = data.channel;

        // 채널 존재 확인
        let findChannelIdx = channels.findIndex((item) => item.channel === channel);
        if(findChannelIdx < 0) {
            socket.emit('redirect', '채널에 참여할 수 없습니다.');
            chat.emit('channel_list', channels);
            return false;
        }

        // 접속한 채널 & 참여자정보 업데이트
        let findUserIdx = users.findIndex((item) => item.user_idx === user.user_idx);
        if(users[findUserIdx].channel) socket.leave(users[findUserIdx].channel);
        socket.join(channel);
        users[findUserIdx].channel = channel;
        channels[findChannelIdx].users.push({ user_idx: user.user_idx, user_name: user.user_name, socket_id: socket.id });
        socket.emit('join', {
            channel: channel,
            title: channels[findChannelIdx].title,
        });
        chat.to(channel).emit('join_list', channels[findChannelIdx].users);
        chat.to(channel).emit('notice', {
            msg: user.user_name + ' 님이 입장하였습니다.',
        });
        chat.emit('channel_list', channels);
        chat.emit('user_list', users);
    });
    socket.on('chat', function(data) {
        let res = {
            author: user.user_name,
            msg: data.msg,
            time: moment().format('LT'), // 오후 2:48
        }
        chat.emit('chat', res);
    });
    socket.on('leave', function(data) {
        // 내가 접속해 있는 채널
        let findUserIdx = users.findIndex((item) => item.user_idx === user.user_idx);
        let channel = users[findUserIdx].channel;

        // 채널에서 나가기
        let findChannelIdx = channels.findIndex((item) => item.channel === channel);
        if(findChannelIdx >= 0) {
            let findChannelUserIdx = channels[findChannelIdx].users.findIndex((item) => item.user_idx === user.user_idx);
            channels[findChannelIdx].users.splice(findChannelUserIdx, 1);
        }
        users[findUserIdx].channel = '';

        socket.leave(channel);

        chat.emit('user_list', users);
        chat.to(channel).emit('notice', {
            msg: user.user_name + ' 님이 나갔습니다.',
        });

        // 채널에 아무도 없으면 지우기
        if(channels[findChannelIdx].users.length < 1) {
            channels.splice(findChannelIdx, 1);
            chat.emit('channel_list', channels);
            return false;
        }
        chat.emit('channel_list', channels);
        chat.to(channel).emit('join_list', channels[findChannelIdx].users);
    });
    socket.on('disconnect', function(data) {
        // 내가 접속해 있는 채널
        let findUserIdx = users.findIndex((item) => item.user_idx === user.user_idx);
        if(findUserIdx >= 0) {
            let channel = users[findUserIdx].channel;
            if(channel) {
                // 채널에서 나가기
                let findChannelIdx = channels.findIndex((item) => item.channel === channel);
                let findChannelUserIdx = channels[findChannelIdx].users.findIndex((item) => item.user_idx === user.user_idx);
                channels[findChannelIdx].users.splice(findChannelUserIdx, 1);
                socket.emit('reload');
                socket.leave(channel);
                users[findUserIdx].channel = '';
            }
        }

        let findidx = users.findIndex((item) => item.user_idx === user.user_idx);
        if(findidx >= 0) {
            users.splice(findidx, 1);
        }
        chat.emit('user_list', users);
    });
});
