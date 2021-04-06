'use strict';

function Cardroyal() {
    let info = {
        play_code: null,
        end: false,
        selected_id: null,
        selected_card: {},
    }
    let rival_king = document.querySelector('#rival-king');
    let rival_deck = document.querySelector('#rival-deck');
    let rival_deck_ready = document.querySelector('#rival-deck-ready');
    let rival_energy = document.querySelector('.rival-energy');
    let rival_card_data = [];
    let rival_king_data = {};
    let rival_deck_data = [];
    let rival_used_data = [];
    let rival_info_data = {
        energy: 0,
    }

    let my_king = document.querySelector('#my-king');
    let my_deck = document.querySelector('#my-deck');
    let my_deck_ready = document.querySelector('#my-deck-ready');
    let my_energy = document.querySelector('.my-energy');
    let my_card_data = []; // 내 전체 카드 - 랜덤으로 저장
    let my_king_data = {}; // 히어로 카드
    let my_deck_data = []; // 덱 카드
    let my_used_data = []; // 사용된 카드
    let my_info_data = {
        energy: 0,
    }
    let socket = io('/cardroyal'); // socket.io 접속
    socket.on('connection', function() {
        socket.emit('ready');
    });
    socket.on('ready', function() {
        // 대기
        console.log('ready...');
    });
    socket.on('go', function() {
        socket.emit('set');
    });
    function modal(msg) {
        document.querySelector('.modal').style.display = 'inline-block';
        document.querySelector('#message').textContent = msg;
        setTimeout(function() {
            document.querySelector('.modal').style.display = 'none';
            document.querySelector('#message').textContent = '';
        }, 1000);
    }
    function energy_action() {
        my_energy.innerHTML = '';
        for(let i=0; i<(my_info_data.energy); i++) {
            let bar = `<span class="bar">${i+1}</span>`;
            my_energy.insertAdjacentHTML('beforeend', bar);
        }
        rival_energy.innerHTML = '';
        for(let i=0; i<(rival_info_data.energy); i++) {
            let bar = `<span class="bar">${i+1}</span>`;
            rival_energy.insertAdjacentHTML('beforeend', bar);
        }
    }
    function card_view(card_data, index, item, who) {
        let card = document.querySelector('.card-hidden .card').cloneNode(true);
        card.id = who + '_' + index;
        switch(card_data.card) {
            case "king":
                card.querySelector('.card-hp').textContent = card_data.hp - card_data.attack_hp + card_data.heal_hp;
                card.querySelector('.card-name').textContent = 'KING';
                card.querySelector('.card-energy').hidden = true;
                card.querySelector('.card-attack').hidden = true;
                card.querySelector('.card-heal').hidden = true;
                break;
            case "attack":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'A';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').textContent = card_data.attack;
                card.querySelector('.card-heal').hidden = true;
                break;
            case "heal":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'H';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').hidden = true;
                card.querySelector('.card-heal').textContent = card_data.heal;
                break;
            case "attack_heal":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'AH';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').textContent = card_data.attack;
                card.querySelector('.card-heal').textContent = card_data.heal;
                break;
        }
        // setTimeout(function() {
            item.appendChild(card);
        // }, 0);
        if(item.id === 'my-deck-ready') card.classList.add('noselect');
        card.addEventListener('click', function() {
            if(info.end) return ;
            if(this.classList.contains('noselect')) return ;
            if(who === 'my') {
                let ex = this.id.split('_');
                if(ex[1] === 'king') {
                    if(!this.classList.contains('possible')) return ;
                    if(info.selected_card.energy > my_info_data.energy) {
                        modal('에너지가 부족합니다.');
                        return ;
                    }
                    socket.emit('king_heal', {
                        selected_id: info.selected_id
                    });
                    return ;
                }
                if(info.selected_id !== null) document.querySelector('#my_'+info.selected_id).classList.remove('selected');
                info.selected_id = ex[1];
                info.selected_card = my_card_data[info.selected_id];
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
                    if(info.selected_card.energy > my_info_data.energy) {
                        modal('에너지가 부족합니다.');
                        return ;
                    }
                    // my_info_data.energy -= info.selected_card.energy;
                    // energy_action();
                    // rival_king_data.attack_hp += info.selected_card.attack;
                    // info.selected_card.target = 'rival_king';
                    socket.emit('king_attack', {
                        selected_id: info.selected_id
                    });
                    return ;
                }
            }
        });
    }
    function set(res) {
        info.play_code = res.play_code;
        my_king_data = res.my_king_data;
        my_king.innerHTML = '';
        card_view(my_king_data, 'king', my_king, 'my');
        my_card_data = res.my_card_data;
        my_deck_data = res.my_deck_data;
        my_used_data = res.my_used_data;
        my_deck.innerHTML = '';
        my_deck_ready.innerHTML = '';
        my_deck_data.forEach(function(v, k) {
            if(k === 4) card_view(my_card_data[v], v, my_deck_ready, 'my');
            else card_view(my_card_data[v], v, my_deck, 'my');
        });
        rival_king_data = res.rival_king_data;
        rival_king.innerHTML = '';
        card_view(rival_king_data, 'king', rival_king, 'rival');
        rival_card_data = res.rival_card_data;
        rival_deck_data = res.rival_deck_data;
        rival_used_data = res.rival_used_data;
        rival_deck.innerHTML = '';
        rival_deck_ready.innerHTML = '';
        rival_deck_data.forEach(function(v, k) {
            if(k === 4) card_view(rival_card_data[v], v, rival_deck_ready, 'rival');
            else card_view(rival_card_data[v], v, rival_deck, 'rival');
        });
    }
    socket.on('reset', function(res) { // 튕김 후 접속시 처리 TO-DO
        console.log('reset', res);
        // view 초기화
        // view reset
        // socket.emit('energy');
        // set(res);
    });
    socket.on('set', function(res) { // 게임 시작시
        // view 초기화
        // view set
        socket.emit('energy');
        set(res);
    });
    socket.on('energy', function(res) {
        if(info.end) return ;
        my_info_data.energy = res.my_energy;
        rival_info_data.energy = res.rival_energy;
        energy_action();
    });
    socket.on('end', function(res) {
        info.end = true;
        setTimeout(function() {
            socket.emit('result', {
                play_code: info.play_code,
            });
            alert(res);
            // modal('종료!');
            // window.location.href = '/';
        }, 300);
    });
    socket.on('result', function(res) {
        let attack = 0;
        let heal = 0;
        let energy = 0;
        res.forEach(function(v, k) {
            if(v.target === 'rival') attack += parseInt(v.attack);
            if(v.target === 'my') heal += parseInt(v.heal);
            energy += parseInt(v.energy);
        });
        console.log('사용한 카드 : ' + res.length);
        console.log('공격 : ' + attack);
        console.log('힐링 : ' + heal);
        console.log('에너지 : ' + energy);
        socket.emit('client-disconnect');
        alert('사용한 카드 : ' + res.length + '\n공격 : ' + attack + '\n힐링 : ' + heal + '\n에너지 : ' + energy);
        window.location.href = '/';
    });
    socket.on('my_action', function(res) {
        let _card = document.querySelector('#my_'+res.selected_id);
        my_deck_data = res.deck_data;
        my_card_data = res.card_data;
        my_used_data = res.used_data;
        _card.style.opacity = 0;
        info.selected_id = null;
        info.selected_card = null;
        setTimeout(function() {
            let new_card = my_deck_ready.childNodes[0];
            new_card.classList.remove('noselect');
            _card.parentNode.insertBefore(new_card, _card);
            _card.parentNode.removeChild(_card);
            card_view(my_card_data[my_used_data.length + 4], my_used_data.length + 4, my_deck_ready, 'my');
        }, 250);
        document.querySelectorAll('.possible').forEach(function(v) {
            v.classList.remove('possible');
        });
        if(res.action === 'heal') {
            my_king_data = res.king_data;
            let king_hp = parseInt(my_king_data.hp + my_king_data.heal_hp - my_king_data.attack_hp);
            document.querySelector('#my_king .card-hp').textContent = (king_hp < 0) ? 0 : king_hp;
        } else if(res.action === 'attack') {
            rival_king_data = res.rival_king_data;
            let king_hp = parseInt(rival_king_data.hp + rival_king_data.heal_hp - rival_king_data.attack_hp);
            document.querySelector('#rival_king .card-hp').textContent = (king_hp < 0) ? 0 : king_hp;
        }
    });
    socket.on('rival_action', function(res) {
        let _card = document.querySelector('#rival_'+res.selected_id);
        rival_deck_data = res.deck_data;
        rival_card_data = res.card_data;
        rival_used_data = res.used_data;
        _card.style.opacity = 0;
        setTimeout(function() {
            let new_card = rival_deck_ready.childNodes[0];
            new_card.classList.remove('noselect');
            _card.parentNode.insertBefore(new_card, _card);
            _card.parentNode.removeChild(_card);
            card_view(rival_card_data[rival_used_data.length + 4], rival_used_data.length + 4, rival_deck_ready, 'rival');
        }, 250);
        document.querySelectorAll('.possible').forEach(function(v) {
            v.classList.remove('possible');
        });
        if(res.action === 'heal') {
            rival_king_data = res.king_data;
            let king_hp = parseInt(rival_king_data.hp + rival_king_data.heal_hp - rival_king_data.attack_hp);
            document.querySelector('#rival_king .card-hp').textContent = (king_hp < 0) ? 0 : king_hp;
        } else if(res.action === 'attack') {
            my_king_data = res.my_king_data;
            let king_hp = parseInt(my_king_data.hp + my_king_data.heal_hp - my_king_data.attack_hp);
            document.querySelector('#my_king .card-hp').textContent = (king_hp < 0) ? 0 : king_hp;
        }
    });
}
