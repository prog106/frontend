const { RSA_NO_PADDING } = require('constants');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

app.set('view engine', 'ejs'); // ejs template
app.set('views', './views');

app.get('/', function(req, res) {
    res.render('chat/index.ejs');
});

app.get('/chat', function(req, res) {
    res.render('chat/chat.ejs');
});

app.get('/room', function(req, res) {
    res.render('chat/room.ejs');
});

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
let rooms = [
    { name: 'Channel A', created_at: '2021-02-17' },
    { name: 'Channel B', created_at: '2021-02-18' },
    { name: 'Channel C', created_at: '2021-02-19' },
];
let chat = io.of('/chat').on('connection', function(socket) {
    socket.on('ready', function(data) { // 방 미선택 상태
        let msg = {
            'msg': '참여할 방을 선택하세요.',
            'rooms': rooms,
        }
        socket.emit('ready', msg);
    });
    socket.on('join', function(data) {
        console.log('message from client: ', data);

        // 방을 만들고, 참여
        if(!rooms[data.room]) { // 없으면 만들기
            console.log(rooms);
            // if(rooms.length >= 3) { // 최대 3개
            //     socket.emit('error', '방을 더 이상 만들 수 없습니다.');
            //     return false;
            // }
            // rooms.push(data.room);
            chat.to(room).emit('join', `${name} 님이 입장하였습니다.`);
            socket.disconnect();
            return false;
        }

        let name = socket.name = data.name;
        let room = socket.room = data.room;

        // room에 join한다
        socket.join(room);
        // room에 join되어 있는 클라이언트에게 메시지를 전송한다
        chat.to(room).emit('join', `${name} 님이 입장하였습니다.`);
    });
    socket.on('chat', function(data) {
        let res = {
            name: socket.name,
            msg: data.msg,
        }
        chat.to(data.room).emit('chat', res);
    });
});
