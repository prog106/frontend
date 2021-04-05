const db = require('../common.js').db();
let rival_king_data = {};
let rival_card_data = [];
let rival_deck_data = [];
let rival_used_data = [];
let my_king_data = {}; // 히어로 카드
let my_card_data = []; // 내 전체 카드 - 랜덤으로 저장
let my_deck_data = [];
let my_used_data = [];
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
            my_card_data.push(_card);
        }
    }
    function heal_card(count) {
        for(let i=0; i<count; i++) {
            let _card = new create_card('heal');
            my_card_data.push(_card);
        }
    }
    function attack_heal_card(count) {
        for(let i=0; i<count; i++) {
            let _card = new create_card('attack_heal');
            my_card_data.push(_card);
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
            rival_card_data.push(_card);
        }
    }
    function heal_card(count) {
        for(let i=0; i<count; i++) {
            let _card = new create_card('heal');
            rival_card_data.push(_card);
        }
    }
    function attack_heal_card(count) {
        for(let i=0; i<count; i++) {
            let _card = new create_card('attack_heal');
            rival_card_data.push(_card);
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

module.exports = function() {
    Mycard();
    // Rivalcard();
    return {
        my_king_data: my_king_data,
        my_card_data: shuffle(my_card_data),
        my_deck_data: [0, 1, 2, 3, 4],
        my_used_data: [],
        // rival_king_data: rival_king_data,
        // rival_card_data: shuffle(rival_card_data),
        // rival_deck_data: [0, 1, 2, 3, 4],
        // rival_used_data: []
    }
}
