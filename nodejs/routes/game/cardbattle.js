const db = require('../../modules/common.js').db();
const moment = require('moment');
moment.locale('ko');
// const cardroyal = require('../../modules/game/cardbattle.js'); // module 호출
// const royal = cardroyal();

module.exports = function(io) {
    let chat = io.of('/cardbattle').on('connection', function(socket) {
        if(!socket.request.session.passport) {
            socket.emit('client-disconnect');
            return ;
        }
        socket.on('connection', function() {
            socket.emit('connection');
        });
    });
    return chat;
}
