const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'ejs'); // ejs template
app.set('views', './views');

app.get('/', function(req, res) {
    res.render('chat/index.ejs');
});

app.get('/chat', function(req, res) {
    res.render('chat/chat.ejs');
});

server.listen(3000, function() {
    console.log('Socket IO port 3000');
});

// connection event handler
io.on('connection', function(socket) {

    /* 
    채팅 event 정보
    join : 클라이언트 접속 - 닉네임 (nickname)
    chat : 클라이언트 메시지 수신 - 메시지 (msg)
    client-disconnect : 클라이언트 나가기
     */
    socket.on('join', function(data) { // event : join - 채팅방 참여
        socket.nickname = data.nickname;
        // io.emit('join', data.nickname); // 채팅방 전체 참여자에게 메시지 전송
        // socket.emit('join', data.nickname); // 자기 자신에게만 메시지 전송
        socket.broadcast.emit('join', data.nickname); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
        // io.to(id).emit('join', data.nickname); // 특정 참여자에게 메시지 전송
    });

    socket.on('chat', function(data) { // event : chat - 채팅방에 메시지 전송
        let msg = {
            from: {
                nickname: socket.nickname
            },
            msg: data.msg
        }
        io.emit('chat', msg); // 채팅방 전체 참여자에게 메시지 전송
        // socket.emit('chat', msg); // 자기 자신에게만 메시지 전송
        // socket.broadcast.emit('chat', msg); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
        // io.to(id).emit('chat', msg); // 특정 참여자에게 메시지 전송
    });

    socket.on('client-disconnect', function() { // event : client-disconnect - 채팅방에서 나가기
        // io.emit('client-disconnect', socket.nickname); // 채팅방 전체 참여자에게 메시지 전송
        // socket.emit('client-disconnect', socket.nickname); // 자기 자신에게만 메시지 전송
        socket.broadcast.emit('client-disconnect', socket.nickname); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
        // io.to(id).emit('client-disconnect', socket.nickname); // 특정 참여자에게 메시지 전송
        socket.disconnect(); // 채팅방 나가기
    })

    socket.on('disconnect', function() { // 접속 끊어진 사용자 로그 남기기
        if(socket.nickname) console.log('disconnect : ' + socket.nickname);
    });

});
