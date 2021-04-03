'use strict';

function Cardroyal() {
    let info = {
        game_idx: 0,
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
        socket.emit('set', true);
    });
    function king_hp() { // HP 처리
        if(info.end) return ;
        socket.emit('king_hp', {
            game_idx: info.game_idx,
        });
        return false;
    }
    function energy_action() {
        my_energy.innerHTML = '';
        for(let i=0; i<my_info_data.energy; i++) {
            let bar = `<span class="bar">${i+1}</span>`;
            my_energy.insertAdjacentHTML('beforeend', bar);
        }
        rival_energy.innerHTML = '';
        for(let i=0; i<rival_info_data.energy; i++) {
            let bar = `<span class="bar">${i+1}</span>`;
            rival_energy.insertAdjacentHTML('beforeend', bar);
        }
    }
    function after_action() { // 공격/힐링 후 처리
        my_used_data.push(my_card_data.splice(parseInt(info.selected_id), 1, null)[0]);
        my_card_data.push(info.selected_card);
        socket.emit('after_action', {
            game_idx: info.game_idx,
            my_card_data: my_card_data,
            my_used_data: my_used_data,
        });
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
                    if(info.selected_card.energy > my_info_data.energy) return ;
                    my_info_data.energy -= info.selected_card.energy;
                    energy_action();
                    my_king_data.heal_hp += info.selected_card.heal;
                    info.selected_card.target = 'my_king';
                    socket.emit('king_heal', {
                        game_idx: info.game_idx,
                        my_king_data: my_king_data
                    });
                    if(king_hp()) return ;
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
                        console.log('에너지가 부족합니다.');
                        return ;
                    }
                    my_info_data.energy -= info.selected_card.energy;
                    energy_action();
                    rival_king_data.attack_hp += info.selected_card.attack;
                    info.selected_card.target = 'rival_king';
                    socket.emit('king_attack', {
                        game_idx: info.game_idx,
                        rival_king_data: rival_king_data
                    });
                    if(king_hp()) return ;
                }
            }
        });
    }
    socket.on('set', function(res) {
        // view 초기화
        // view set
        info.game_idx = res.game_idx;
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
    });
    socket.on('energy', function(res) {
        if(info.end) return ;
        if(my_info_data.energy < 10) my_info_data.energy += res;
        if(rival_info_data.energy < 10) rival_info_data.energy += res;
        energy_action();
    });
    socket.on('end', function(res) {
        setTimeout(function() {
            socket.emit('result', {
                game_idx: info.game_idx,
            });
            alert(res);
            // window.location.href = '/';
        }, 300);
    });
    socket.on('result', function(res) {
        let attack = 0;
        let heal = 0;
        let energy = 0;
        res.forEach(function(v, k) {
            if(v.target === 'rival_king') attack += parseInt(v.attack);
            if(v.target === 'my_king') heal += parseInt(v.heal);
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
    socket.on('king_hp', function(res) {
        document.querySelector('#rival_king .card-hp').textContent = res.rival_hp;
        document.querySelector('#my_king .card-hp').textContent = res.my_hp;
        after_action();
        if(res.end) {
            info.end = true;
            return ;
        }
    });
    socket.on('after_action', function() {
        let _card = document.querySelector('#my_'+info.selected_id);
        _card.style.opacity = 0;
        setTimeout(function() {
            let new_card = my_deck_ready.childNodes[0];
            let new_idx = parseInt(new_card.id.split('_')[1]);
            _card.parentNode.childNodes.forEach(function(v, k) {
                if(v.classList.contains('selected')) {
                    my_deck_data.splice(k, 1, new_idx);
                    my_deck_data.splice(4, 1, my_used_data.length + 4);
                    socket.emit('deck_action', {
                        game_idx: info.game_idx,
                        my_deck_data: my_deck_data,
                    });
                }
            });
            new_card.classList.remove('noselect');
            _card.parentNode.insertBefore(new_card, _card);
            _card.parentNode.removeChild(_card);
            card_view(my_card_data[my_used_data.length + 4], my_used_data.length + 4, my_deck_ready, 'my');
        }, 500);
        document.querySelectorAll('.possible').forEach(function(v) {
            v.classList.remove('possible');
        });
        info.selected_id = null;
        info.selected_card = null;
    });
}
