'use strict';

function Cardroyal() {
    let info = {
        end: false,
        selected_id: null,
        selected_card: {},
    }

    let rival_card = document.querySelector('#rival-card');
    let rival_king = document.querySelector('#rival-king');
    let rival_deck = document.querySelector('#rival-deck');
    let rival_deck_ready = document.querySelector('#rival-deck-ready');
    let rival_energy = document.querySelector('#rival-energy');
    let rival_deck_data = [];
    let rival_king_data = {};
    let rival_card_data = [];
    let rival_used_card_data = [];
    let rival_info_data = {
        energy: 0,
        attack: 0,
        heal: 0,
    }

    let my_card = document.querySelector('#my-card');
    let my_king = document.querySelector('#my-king');
    let my_deck = document.querySelector('#my-deck');
    let my_deck_ready = document.querySelector('#my-deck-ready');
    let my_energy = document.querySelector('#my-energy');
    let my_deck_data = []; // 내 전체 카드 - 랜덤으로 저장
    let my_king_data = {}; // 히어로 카드
    let my_card_data = { // 내 카드
        'card1': null,
        'card2': null,
        'card3': null,
        'card4': null,
        'ready': null,
    }
    let my_used_card_data = []; // 사용된 카드
    let my_info_data = {
        energy: 0,
        attack: 0,
        heal: 0,
    }
    Mycard();
    Rivalcard();
    init();
    function king_hp() { // HP 처리
        if(info.end) return ;
        let rival_hp = rival_king_data.hp - rival_king_data.attack_hp + rival_king_data.heal_hp;
        let my_hp = my_king_data.hp - my_king_data.attack_hp + my_king_data.heal_hp;
        document.querySelector('#rival_king .card-hp').textContent = (rival_hp < 0) ? 0 : rival_hp;
        document.querySelector('#my_king .card-hp').textContent = (my_hp < 0) ? 0 : my_hp;
        if(rival_hp <= 0) { // 내가 승리
            info.end = true;
            console.log('Win');
            return true;
        } else if(my_hp <= 0) { // 내가 패배
            info.end = true;
            console.log('Lose');
            return true;
        }
        after_action();
        return false;
    }
    function after_action() { // 공격/힐링 후 처리
        my_used_card_data.push(my_deck_data.splice(parseInt(info.selected_id), 1, null)[0]);
        my_deck_data.push(info.selected_card);
        let _card = document.querySelector('#my_'+info.selected_id);
        _card.style.opacity = 0;
        setTimeout(function() {
            let new_card = my_deck_ready.childNodes[0];
            new_card.classList.remove('noselect');
            _card.parentNode.insertBefore(new_card, _card);
            _card.parentNode.removeChild(_card);
            card_view(my_deck_data[my_used_card_data.length + 4], my_used_card_data.length + 4, my_deck_ready, 'my');
        }, 250);
        document.querySelectorAll('.possible').forEach(function(v) {
            v.classList.remove('possible');
        });
        info.selected_id = null;
        info.selected_card = null;
    }
    function card_view(card_data, index, item, who) {
        let card = document.querySelector('.card-hidden .card').cloneNode(true);
        card.id = who + '_' + index;
        switch(card_data.card) {
            case "king":
                card.querySelector('.card-hp').textContent = card_data.hp;
                card.querySelector('.card-name').textContent = 'KING';
                card.querySelector('.card-energy').hidden = true;
                card.querySelector('.card-attack').hidden = true;
                card.querySelector('.card-heal').hidden = true;
                break;
            case "attack":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'CARD-A';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').textContent = card_data.attack;
                card.querySelector('.card-heal').hidden = true;
                // this.target = ['king']; // king, card
                break;
            case "heal":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'CARD-H';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').hidden = true;
                card.querySelector('.card-heal').textContent = card_data.heal;
                // this.target = ['king']; // king, card
                break;
            case "attack_heal":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'CARD-AH';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').textContent = card_data.attack;
                card.querySelector('.card-heal').textContent = card_data.heal;
                // this.target = ['king']; // king, card
                break;
        }
        setTimeout(function(){
            item.appendChild(card);
        }, 250);
        if(item.id === 'my-deck-ready') card.classList.add('noselect');
        card.addEventListener('click', function() {
            if(info.end) return ;
            if(this.classList.contains('noselect')) return ;
            if(who === 'my') {
                let ex = this.id.split('_');
                if(ex[1] === 'king') {
                    if(!this.classList.contains('possible')) return ;
                    if(energy()) return ;
                    my_king_data.heal_hp += info.selected_card.heal;
                    console.log(my_king_data);
                    if(king_hp()) return ;
                    return ;
                }
                if(info.selected_id) document.querySelector('#my_'+info.selected_id).classList.remove('selected');
                info.selected_id = ex[1];
                info.selected_card = my_deck_data[info.selected_id];
                document.querySelector('#my_'+info.selected_id).classList.add('selected');
                document.querySelectorAll('.possible').forEach(function(v) {
                    v.classList.remove('possible');
                });
                if(info.selected_card.card === 'attack') { // 상대
                    document.querySelector('#rival_king').classList.add('possible');
                    // console.log(info.selected_card.target);
                } else if(info.selected_card.card === 'heal') { // 나
                    document.querySelector('#my_king').classList.add('possible');
                    // console.log(info.selected_card.target);
                } else if(info.selected_card.card === 'attack_heal') { // 양쪽
                    document.querySelector('#my_king').classList.add('possible');
                    document.querySelector('#rival_king').classList.add('possible');
                    // console.log(info.selected_card.target);
                }
            } else if(who === 'rival') {
                if(info.selected_id && info.selected_card) {
                    // 공격카드 범위 체크
                    if(!this.classList.contains('possible')) return ;
                    if(energy()) return ;
                    rival_king_data.attack_hp += info.selected_card.attack;
                    if(king_hp()) return ;
                }
            }
        });
    }
    function shuffle(array) {
        let shuffle_data = [];
        while(array.length !== 0) {
            shuffle_data.push(array.splice(Math.floor(Math.random() * array.length), 1)[0]);
        }
        return shuffle_data;
    }
    function energy() {
        if(info.selected_card.energy <= my_info_data.energy) {
            my_info_data.energy -= info.selected_card.energy;
            document.querySelector('#my-energy').textContent = my_info_data.energy;
            return false;
        }
        return true;
    }
    function increment_energy() {
        setInterval(function() {
            if(my_info_data.energy < 10) my_info_data.energy += 1;
            if(rival_info_data.energy < 10) rival_info_data.energy += 1;
            document.querySelector('#my-energy').textContent = my_info_data.energy;
            document.querySelector('#rival-energy').textContent = rival_info_data.energy;
        }, 2000);
    }
    function init() {
        card_view(my_king_data, 'king', my_king, 'my');
        my_deck_data = shuffle(my_deck_data);
        my_deck_data.forEach(function(v, k) {
            if(k == 4) card_view(v, k, my_deck_ready, 'my');
            if(k > 3) return false;
            else card_view(v, k, my_deck, 'my');
        });
        card_view(rival_king_data, 'king', rival_king, 'rival');
        rival_deck_data = shuffle(rival_deck_data);
        rival_deck_data.forEach(function(v, k) {
            if(k == 4) card_view(v, k, rival_deck_ready, 'rival');
            if(k > 3) return false;
            else card_view(v, k, rival_deck, 'rival');
        });
        increment_energy();
        // my_energy.textContent = my_info_data.energy;
        // rival_energy.textContent = rival_info_data.energy;
        // document.querySelector('#change_turn').addEventListener('click', function() {
        //     if(info.end) return ;
        //     info.myturn = !info.myturn;
        //     if(info.myturn) {
        //         document.querySelector('.rival_info').classList.remove('turn');
        //         document.querySelector('.my_info').classList.add('turn');
        //         my_info_data.energy = 10;
        //         my_energy.textContent = my_info_data.energy;
        //     } else {
        //         document.querySelector('.my_info').classList.remove('turn');
        //         document.querySelector('.rival_info').classList.add('turn');
        //         info.ready = true;
        //         rival_info_data.energy = 10;
        //         rival_energy.textContent = rival_info_data.energy;
        //     }
        // });
    }
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
                this.target = ['king']; // king, card
                break;
            case "heal":
                this.energy = Math.ceil(Math.random() * 5) + 1; // 2~6
                this.heal = this.energy + 1;
                this.target = ['king']; // king, card
                break;
            case "attack_heal":
                this.energy = Math.ceil(Math.random() * 5) + 1; // 2~6
                this.attack = this.energy - 1;
                this.heal = this.energy - 1;
                this.target = ['king']; // king, card
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
}
