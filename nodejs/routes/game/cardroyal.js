const db = require('../../modules/common.js').db();
const cardroyal = require('../../modules/game/cardroyal.js'); // module 호출
// const royal = cardroyal();

module.exports = function(io) {
    let chat = io.of('/cardroyal').on('connection', function(socket) {
        if(!socket.request.session.passport) {
            socket.emit('client-disconnect');
            return ;
        }
        socket.emit('connection');
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
                    if(rows.length > 0) {
                        res = rows[0];
                        game_idx = res.game_idx;
                        my_king_data = JSON.parse(res.my_king_data);
                        my_card_data = JSON.parse(res.my_card_data);
                        my_deck_data = JSON.parse(res.my_deck_data);
                        my_used_data = JSON.parse(res.my_used_data);
                        rival_king_data = JSON.parse(res.rival_king_data);
                        rival_card_data = JSON.parse(res.rival_card_data);
                        rival_deck_data = JSON.parse(res.rival_deck_data);
                        rival_used_data = JSON.parse(res.rival_used_data);
                        socket.emit('set', {
                            game_idx: game_idx,
                            my_king_data: my_king_data,
                            my_card_data: my_card_data,
                            my_deck_data: my_deck_data,
                            my_used_data: my_used_data,
                            rival_king_data: rival_king_data,
                            rival_card_data: rival_card_data,
                            rival_deck_data: rival_deck_data,
                            rival_used_data: rival_used_data,
                        });
                    } else {
                        res = cardroyal(user.user_idx);
                        db.query(`INSERT INTO test_game_cardroyal (user_idx, my_king_data, my_card_data, my_deck_data, my_used_data, rival_king_data, rival_card_data, rival_deck_data, rival_used_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                            [
                                user.user_idx,
                                JSON.stringify(res.my_king_data),
                                JSON.stringify(res.my_card_data),
                                JSON.stringify(res.my_deck_data),
                                JSON.stringify(res.my_used_data),
                                JSON.stringify(res.rival_king_data),
                                JSON.stringify(res.rival_card_data),
                                JSON.stringify(res.rival_deck_data),
                                JSON.stringify(res.rival_used_data)
                            ],
                            function(err, rows, fields) {
                                if(err) return false;
                                game_idx = rows.insertId;
                                my_king_data = res.my_king_data;
                                my_card_data = res.my_card_data;
                                my_deck_data = res.my_deck_data;
                                my_used_data = res.my_used_data;
                                rival_king_data = res.rival_king_data;
                                rival_card_data = res.rival_card_data;
                                rival_deck_data = res.rival_deck_data;
                                rival_used_data = res.rival_used_data;
                                socket.emit('set', {
                                    game_idx: game_idx,
                                    my_king_data: my_king_data,
                                    my_card_data: my_card_data,
                                    my_deck_data: my_deck_data,
                                    my_used_data: my_used_data,
                                    rival_king_data: rival_king_data,
                                    rival_card_data: rival_card_data,
                                    rival_deck_data: rival_deck_data,
                                    rival_used_data: rival_used_data,
                                });
                            }
                        );
                    }
                }
            );
            socket.emit('energy', 1);
            setInterval(function() { socket.emit('energy', 1); }, 1000); // redis
        });
        socket.on('after_action', function(data) {
            db.query(`UPDATE test_game_cardroyal SET my_card_data = ?, my_used_data = ? WHERE game_idx = ? AND user_idx = ?`,
                [JSON.stringify(data.my_card_data), JSON.stringify(data.my_used_data), data.game_idx, user.user_idx],
                function(err, rows, fields) {
                    socket.emit('after_action');
                }
            );
        });
        socket.on('deck_action', function(data) {
            db.query(`UPDATE test_game_cardroyal SET my_deck_data = ? WHERE game_idx = ? AND user_idx = ?`,
                [JSON.stringify(data.my_deck_data), data.game_idx, user.user_idx],
                function(err, rows, fields) {
                }
            );
        });
        socket.on('king_hp', function(data) {
            db.query(`SELECT * FROM test_game_cardroyal WHERE game_idx = ? AND user_idx = ?`,
                [data.game_idx, user.user_idx],
                function(err, rows, fields) {
                    let row = rows[0];
                    my_king_data = JSON.parse(row.my_king_data);
                    rival_king_data = JSON.parse(row.rival_king_data);
                    my_hp = my_king_data.hp - my_king_data.attack_hp + my_king_data.heal_hp;
                    rival_hp = rival_king_data.hp - rival_king_data.attack_hp + rival_king_data.heal_hp;
                    socket.emit('king_hp', {
                        my_hp: (my_hp < 0) ? 0 : my_hp,
                        rival_hp: (rival_hp < 0) ? 0 : rival_hp,
                        end: (my_hp <= 0 || rival_hp <= 0) ? true : false,
                    });
                    if(rival_hp <= 0 || my_hp <= 0) {
                        db.query(`UPDATE test_game_cardroyal SET end = 1 WHERE game_idx = ? AND user_idx = ?`,
                            [data.game_idx, user.user_idx],
                            function(err, rows, fields) {
                            }
                        );
                        if(rival_hp <= 0) {
                            socket.emit('end', 'You Win!'); // 내가 승리
                        } else if(my_hp <= 0) {
                            socket.emit('end', 'You Lose...'); // 내가 패배
                        }
                    }
                }
            )
        });
        socket.on('king_heal', function(data) {
            let my_king_data = JSON.stringify(data.my_king_data);
            db.query(`UPDATE test_game_cardroyal SET my_king_data = ? WHERE game_idx = ? AND user_idx = ?`,
                [my_king_data, data.game_idx, user.user_idx],
                function(err, rows, fields) {
                }
            );
        });
        socket.on('king_attack', function(data) {
            let rival_king_data = JSON.stringify(data.rival_king_data);
            db.query(`UPDATE test_game_cardroyal SET rival_king_data = ? WHERE game_idx = ? AND user_idx = ?`,
                [rival_king_data, data.game_idx, user.user_idx],
                function(err, rows, fields) {
                }
            );
        });
        socket.on('result', function(data) {
            db.query(`SELECT * FROM test_game_cardroyal WHERE game_idx = ?`,
                [data.game_idx, user.user_idx],
                function(err, rows, fields) {
                    let res = JSON.parse(rows[0].my_used_data);
                    socket.emit('result', res);
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
