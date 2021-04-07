'use strict';

function Cardbattle() {
    let socket = io('/cardroyal'); // socket.io 접속
    init();
    socket.on('connection', function() {
        console.log('Cardbattle');
    });
    function init() {
        socket.emit('connection');
    }
}
