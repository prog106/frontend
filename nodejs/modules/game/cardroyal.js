const db = require('../common.js').db();
module.exports = function() {
    let rival_deck_data = [];
    let rival_king_data = {};
    let my_deck_data = []; // 내 전체 카드 - 랜덤으로 저장
    let my_king_data = {}; // 히어로 카드
    function create_card(opt) { // 5 + 1
        this.card = opt;
        switch(opt) {
            case "king":
                this.hp = Math.ceil(Math.random() * 5) + 25; // 26~30
                this.attack_hp = 0;
                this.heal_hp = 0;
                break;
            case "attack":
                this.energy = Math.ceil(Math.random() * 5) + 1; // 2~6
                this.attack = this.energy + 1;
                break;
            case "heal":
                this.energy = Math.ceil(Math.random() * 5) + 1; // 2~6
                this.heal = this.energy + 1;
                break;
            case "attack_heal":
                this.energy = Math.ceil(Math.random() * 5) + 1; // 2~6
                this.attack = this.energy - 1;
                this.heal = this.energy - 1;
                break;
        }
    }
    function Mycard() {
        king_card();
        attack_card(4);
        heal_card(3);
        attack_heal_card(1);
        function king_card() {
            my_king_data = new create_card('king');
        }
        function attack_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('attack');
                my_deck_data.push(_card);
            }
        }
        function heal_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('heal');
                my_deck_data.push(_card);
            }
        }
        function attack_heal_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('attack_heal');
                my_deck_data.push(_card);
            }
        }
    }
    function Rivalcard() {
        king_card();
        attack_card(4);
        heal_card(3);
        attack_heal_card(1);
        function king_card() {
            rival_king_data = new create_card('king');
        }
        function attack_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('attack');
                rival_deck_data.push(_card);
            }
        }
        function heal_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('heal');
                rival_deck_data.push(_card);
            }
        }
        function attack_heal_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('attack_heal');
                rival_deck_data.push(_card);
            }
        }
    }
    function shuffle(array) {
        let shuffle_data = [];
        while(array.length !== 0) {
            shuffle_data.push(array.splice(Math.floor(Math.random() * array.length), 1)[0]);
        }
        return shuffle_data;
    }
    function load(user_idx) {
        Mycard();
        Rivalcard();
        let response = {};
        response.my_deck_data = shuffle(my_deck_data);
        response.my_king_data = my_king_data;
        response.rival_deck_data = shuffle(rival_deck_data);
        response.rival_king_data = rival_king_data;

        db.query(`INSERT INTO test_game_cardroyal (user_idx, my_deck_data, my_king_data, rival_deck_data, rival_king_data, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
            [user_idx, JSON.stringify(response.my_deck_data), JSON.stringify(response.my_king_data), JSON.stringify(response.rival_deck_data), JSON.stringify(response.rival_king_data)],
            function(err, rows, fields) {
                if(err) return false;
                // db.query(`INSERT INTO test_game_cardroyal_player (user_idx, game_idx) VALUES (?, ?)`,
                //     [user_idx, rows.insertId],
                //     function(err, rows, fields) {
                //         if(err) return false;
                //     }
                // )
            }
        );
        return response;
    }
    return {
        load: load,
    }
}
