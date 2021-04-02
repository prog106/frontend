const db = require('../../modules/common.js').db();
// const { db } = require('../../modules/common.js');
const cardroyal = require('../../modules/game/cardroyal.js'); // module 호출
const royal = cardroyal();

module.exports = function(io) {
    let chat = io.of('/cardroyal').on('connection', function(socket) {
        let info = {
            end: false,
        }
        let my_deck_data = [];
        let my_king_data = {};
        let rival_deck_data = [];
        let rival_king_data = {};
        if(!socket.request.session.passport) {
            socket.emit('client-disconnect');
            return ;
        }
        let user = socket.request.session.passport.user; // 사용자 세션정보
        // socket.on('join', function(data) { // event : join - 채팅방 참여
            // socket.nickname = data.nickname;
            // chat.emit('join', data.nickname); // 채팅방 전체 참여자에게 메시지 전송
            // socket.emit('join', data.nickname); // 자기 자신에게만 메시지 전송
            // socket.broadcast.emit('join', data.nickname); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
            // chat.to(id).emit('join', data.nickname); // 특정 참여자에게 메시지 전송
        // });
        socket.on('set', function(data) {
            db.query(`SELECT * FROM test_game_cardroyal WHERE user_idx = ? AND end = 0`,
                [user.user_idx],
                function(err, rows, fields) {
                    let res;
                    if(rows.length < 1) {
                        res = royal.load(user.user_idx);
                        my_deck_data = res.my_deck_data;
                        my_king_data = res.my_king_data;
                        rival_deck_data = res.rival_deck_data;
                        rival_king_data = res.rival_king_data;
                    } else {
                        res = rows[0];
                        my_deck_data = JSON.parse(res.my_deck_data);
                        my_king_data = JSON.parse(res.my_king_data);
                        rival_deck_data = JSON.parse(res.rival_deck_data);
                        rival_king_data = JSON.parse(res.rival_king_data);
                    }
                    let response = {
                        my_deck_data: my_deck_data.slice(0, 5),
                        my_king_data: my_king_data,
                        rival_deck_data: rival_deck_data.slice(0, 5),
                        rival_king_data: rival_king_data,
                    };
                    chat.emit('set', response);
                    setInterval(function() { socket.emit('energy', 1); }, 1000); // redis
                }
            );
        });
        socket.on('end', function(data) {
            db.query(`UPDATE test_game_cardroyal SET end = 1 WHERE user_idx = ?`,
                [user.user_idx],
                function(err, rows, fields) {
                    socket.emit('end', data);
                }
            );
        });
        socket.on('king_hp', function(data) {
            db.query(`SELECT * FROM test_game_cardroyal WHERE user_idx = ? AND end = 0`,
                [user.user_idx],
                function(err, rows, fields) {
                    let row = rows[0];
                    let my_king_data = JSON.parse(row.my_king_data);
                    let rival_king_data = JSON.parse(row.rival_king_data);
                    let my_hp = my_king_data.hp - my_king_data.attack_hp + my_king_data.heal_hp;
                    let rival_hp = rival_king_data.hp - rival_king_data.attack_hp + rival_king_data.heal_hp;
                    socket.emit('king_hp', {
                        my_hp: (my_hp < 0) ? 0 : my_hp,
                        rival_hp: (rival_hp < 0) ? 0 : rival_hp,
                        end: (my_hp <= 0 || rival_hp <= 0) ? true : false,
                    });
                    if(rival_hp <= 0) { // 내가 승리
                        db.query(`UPDATE test_game_cardroyal SET end = 1 WHERE user_idx = ?`,
                            [user.user_idx],
                            function(err, rows, fields) {
                            }
                        );
                        socket.emit('end', 'You Win!');
                    } else if(my_hp <= 0) { // 내가 패배
                        db.query(`UPDATE test_game_cardroyal SET end = 1 WHERE user_idx = ?`,
                            [user.user_idx],
                            function(err, rows, fields) {
                            }
                        );
                        socket.emit('end', 'You Lose...');
                    }
                }
            )
        });
        socket.on('king_heal', function(data) {
            let my_king_data = JSON.stringify(data.my_king_data);
            db.query(`UPDATE test_game_cardroyal SET my_king_data = ? WHERE user_idx = ? AND end = 0`,
                [my_king_data, user.user_idx],
                function(err, rows, fields) {
                }
            );
        });
        socket.on('king_attack', function(data) {
            let rival_king_data = JSON.stringify(data.rival_king_data);
            db.query(`UPDATE test_game_cardroyal SET rival_king_data = ? WHERE user_idx = ? AND end = 0`,
                [rival_king_data, user.user_idx],
                function(err, rows, fields) {
                }
            );
        });
        socket.on('success', function(data) {
            db.query(`INSERT INTO test_game_minesweeper (user_idx, vertical, horizontal, mine, sec, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
                [user.user_idx, data.ver, data.hor, data.mine, data.sec],
                function(err, rows, fields) {
                    if(!err) socket.emit('success');
                    db.query(`SELECT * FROM test_game_minesweeper ORDER BY game_idx DESC LIMIT 10`,
                        [],
                        function(err, rows, fields) {
                            chat.emit('ranking', rows);
                        }
                    );
                    // chat.emit('chat', msg); // 채팅방 전체 참여자에게 메시지 전송
                    // socket.emit('chat', msg); // 자기 자신에게만 메시지 전송
                    // socket.broadcast.emit('chat', msg); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
                    // chat.to(id).emit('chat', msg); // 특정 참여자에게 메시지 전송
                }
            );
        });
        socket.on('ranking', function() {
            db.query(`SELECT * FROM test_game_minesweeper ORDER BY game_idx DESC LIMIT 10`,
                [],
                function(err, rows, fields) {
                    chat.emit('ranking', rows);
                }
            );
        });
        socket.on('client-disconnect', function() { // event : client-disconnect - 채팅방에서 나가기
            // chat.emit('client-disconnect', socket.nickname); // 채팅방 전체 참여자에게 메시지 전송
            socket.emit('client-disconnect', user.user_name); // 자기 자신에게만 메시지 전송
            // socket.broadcast.emit('client-disconnect', socket.nickname); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
            // chat.to(id).emit('client-disconnect', socket.nickname); // 특정 참여자에게 메시지 전송
            socket.disconnect(); // 채팅방 나가기
        });
        socket.on('disconnect', function() { // 접속 끊어진 사용자 로그 남기기
            // if(socket.nickname) console.log('disconnect : ' + socket.nickname);
        });
    });
    return chat;
}
