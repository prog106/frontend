const moment = require('moment');
moment.locale('ko');
module.exports = function(io) {
    function makeRandomName() { // 랜덤 3글자
        let name = '';
        let possible = "abcdefghijklmnopqrstuvwxyz";
        for( let i = 0; i < 3; i++ ) {
            name += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return name;
    }
    let channels = [];
    let users = [];
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
            // 접속해 있는 채널
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
                    chat.to(channel).emit('notice', {
                        msg: user.user_name + ' 님이 나갔습니다.',
                    });
                    chat.to(channel).emit('join_list', channels[findChannelIdx].users);
                }
            }
    
            let findidx = users.findIndex((item) => item.user_idx === user.user_idx);
            if(findidx >= 0) {
                users.splice(findidx, 1);
            }
            chat.emit('channel_list', channels);
            chat.emit('user_list', users);
        });
    });
    return chat;
}
