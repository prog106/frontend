const db = require('../../modules/common.js').db();
const moment = require('moment');
moment.locale('ko');
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
        function makeRandomName() { // unique
            let name = moment().format('YYMMDD');
            let possible = "abcdefghijklmnopqrstuvwxyz1234567890";
            for( let i = 0; i < 4; i++ ) {
                name += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return name;
        }
        // socket.on('join', function(data) { // event : join - 채팅방 참여
            // socket.nickname = data.nickname;
            // chat.emit('join', data.nickname); // 채팅방 전체 참여자에게 메시지 전송
            // socket.emit('join', data.nickname); // 자기 자신에게만 메시지 전송
            // socket.broadcast.emit('join', data.nickname); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
            // chat.to(id).emit('join', data.nickname); // 특정 참여자에게 메시지 전송
        // });
        socket.on('ready', function() {
            db.query(`SELECT * FROM test_game_cardroyal WHERE user_idx = ? AND end = 0`,
                [user.user_idx],
                function(err, rows, fields) {
                    // console.log(rows);
                    // , rows.length);
                    // return ;
                    if(rows && rows.length > 0) {
                        // 튕김 참여
                    } else {
                        // 신규 참여
                        db.query(`SELECT * FROM test_game_cardroyal WHERE end = 0 LIMIT 1`, [], function(err, rows, fields) { // 상대가 있을 경우
                            if(rows && rows.length > 0) {
                                card = cardroyal();
                                play_code = rows[0].play_code;
                                db.query(`INSERT INTO test_game_cardroyal (play_code, user_idx, king_data, card_data, deck_data, used_data, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                                    [
                                        play_code,
                                        user.user_idx,
                                        JSON.stringify(card.my_king_data),
                                        JSON.stringify(card.my_card_data),
                                        JSON.stringify(card.my_deck_data),
                                        JSON.stringify(card.my_used_data)
                                    ],
                                    function(err, rows, fields) {
                                        if(err) return false;
                                        db.query(`INSERT INTO test_game_cardroyal_energy VALUES (?, ?, 0, 0)`,
                                            [user.user_idx, play_code],
                                            function(err, rows, fields) {
                                                if(err) return false;
                                                socket.join(play_code);
                                                chat.to(play_code).emit('go');
                                            }
                                        );
                                    }
                                );
                            } else {
                                play_code = makeRandomName();
                                card = cardroyal();
                                db.query(`INSERT INTO test_game_cardroyal (play_code, user_idx, king_data, card_data, deck_data, used_data, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                                    [
                                        play_code,
                                        user.user_idx,
                                        JSON.stringify(card.my_king_data),
                                        JSON.stringify(card.my_card_data),
                                        JSON.stringify(card.my_deck_data),
                                        JSON.stringify(card.my_used_data)
                                    ],
                                    function(err, rows, fields) {
                                        if(err) return false;
                                        db.query(`INSERT INTO test_game_cardroyal_energy VALUES (?, ?, 0, 0)`,
                                            [user.user_idx, play_code],
                                            function(err, rows, fields) {
                                                if(err) return false;
                                                socket.join(play_code);
                                                socket.emit('ready');
                                            }
                                        );
                                    }
                                );
                            }
                        });
                    }
                }
            );
        });
        socket.on('set', function(data) {
            db.query(`SELECT
                        A.king_data AS my_king_data,
                        A.card_data AS my_card_data,
                        A.deck_data AS my_deck_data,
                        A.used_data AS my_used_data,
                        B.king_data AS rival_king_data,
                        B.card_data AS rival_card_data,
                        B.deck_data AS rival_deck_data,
                        B.used_data AS rival_used_data
                    FROM test_game_cardroyal A
                        INNER JOIN test_game_cardroyal B ON B.play_code = A.play_code AND B.user_idx != A.user_idx AND B.end = 0
                    WHERE 1=1
                        AND A.user_idx = ?
                        AND A.end = 0`,
                [user.user_idx],
                function(err, rows, fields) {
                    if(rows && rows.length > 0) {
                        res = rows[0];
                        play_code = res.play_code;
                        my_king_data = JSON.parse(res.my_king_data);
                        my_card_data = JSON.parse(res.my_card_data);
                        my_deck_data = JSON.parse(res.my_deck_data);
                        my_used_data = JSON.parse(res.my_used_data);
                        rival_king_data = JSON.parse(res.rival_king_data);
                        rival_card_data = JSON.parse(res.rival_card_data);
                        rival_deck_data = JSON.parse(res.rival_deck_data);
                        rival_used_data = JSON.parse(res.rival_used_data);
                        socket.emit('set', {
                            play_code: play_code,
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
                        db.query(`SELECT * FROM test_game_cardroyal WHERE user_idx = ? AND end = 0`, [user.user_idx], function(err, rows, fields) {
                            if(rows.length > 0) {
                                socket.emit('ready');
                            } else {
                                socket.emit('retry');
                            }
                        });
                    }
                }
            );
        });
        socket.on('energy', function() {
            setInterval(function() {
                db.query(`SELECT A.energy AS my_energy, A.used_energy AS my_used_energy, B.energy AS rival_energy, B.used_energy AS rival_used_energy FROM test_game_cardroyal_energy A
                    INNER JOIN test_game_cardroyal_energy B ON B.play_code = A.play_code AND B.user_idx != A.user_idx
                    WHERE A.user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                    // play_code = rows[0].play_code;
                    let row = rows[0];
                    my_energy = row.my_energy - row.my_used_energy;
                    rival_energy = row.rival_energy - row.rival_used_energy;
                    socket.emit('energy', {
                        my_energy: my_energy,
                        rival_energy: rival_energy,
                    });
                    db.query(`UPDATE test_game_cardroyal_energy SET energy = energy + 1 WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                    });
                });
            }, 2000); // redis
            // socket.emit('energy', 1);
            // setInterval(function() { socket.emit('energy', 1); }, 1000); // redis
        });
        // socket.on('energy_action', function(data) {
        //     used_energy = data.
        //     db.query(`UPDATE test_game_cardroyal_energy SET used_energy = used_energy + ?  WHERE user_idx = ?`, [used_energy, user.user_idx], function(err, rows, fields) {
        //     });
        // });
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
            db.query(`SELECT * FROM test_game_cardroyal WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                let row = rows[0];
                let king_data = JSON.parse(row.king_data);
                let card_data = JSON.parse(row.card_data);
                let deck_data = JSON.parse(row.deck_data);
                let used_data = JSON.parse(row.used_data);
                let heal_card = card_data[data.selected_id]; // 카드정보
                king_data.heal_hp += heal_card.heal; // 킹카드 처리
                used_data.push(card_data.splice(parseInt(data.selected_id), 1, null)[0]); // 사용카드 빼와서 제일 뒤로 보내기
                card_data.push(heal_card); // 사용카드 제일 뒤로
                let idx = deck_data.indexOf(parseInt(data.selected_id)); // 덱카드 수정 [0, 1, 2, 3, 4] > [0, 4, 2, 3, 5]
                deck_data.splice(idx, 1, deck_data[4]);
                deck_data.splice(4, 1, used_data.length + 4);

                let my_king_data = JSON.stringify(king_data);
                let my_card_data = JSON.stringify(card_data);
                let my_deck_data = JSON.stringify(deck_data);
                let my_used_data = JSON.stringify(used_data);
                db.query(`UPDATE test_game_cardroyal SET king_data = ?, card_data = ?, deck_data = ?, used_data = ? WHERE user_idx = ?`,
                    [my_king_data, my_card_data, my_deck_data, my_used_data, user.user_idx],
                    function(err, rows, fields) {
                    }
                );
                db.query(`UPDATE test_game_cardroyal_energy SET used_energy = used_energy + ? WHERE user_idx = ?`,
                    [heal_card.energy, user.user_idx],
                    function(err, rows, fields) {
                    }
                );
                socket.emit('my_action', {
                    selected_id: parseInt(data.selected_id),
                    king_data: king_data,
                    card_data: card_data,
                    deck_data: deck_data,
                    used_data: used_data,
                });
                socket.broadcast.emit('rival_action', {
                    selected_id: parseInt(data.selected_id),
                    king_data: king_data,
                    card_data: card_data,
                    deck_data: deck_data,
                    used_data: used_data,
                });
            });
            // let heal_data = data.heal_data;
            // let king_data = data.king_data;
            // db.query(`UPDATE test_game_cardroyal_energy SET used_energy = used_energy - ?  WHERE user_idx = ?`, [heal_data.energy, user.user_idx], function(err, rows, fields) {
            // });
            // king_data.heal_hp += heal_data.heal;
            // let my_king_data = JSON.stringify(king_data);
            // db.query(`UPDATE test_game_cardroyal SET king_data = ? WHERE user_idx = ?`,
            //     [my_king_data, data.game_idx, user.user_idx],
            //     function(err, rows, fields) {
            //     }
            // );
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
