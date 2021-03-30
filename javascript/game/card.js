'use strict';

function Cards() {
    let hor = 4; // 가로
    let ver = 3; // 세로
    let flag_click = true;
    let open_count = 0;
    let click_card = [];
    let btn = document.querySelector('#try');
    btn.addEventListener('click', function() {
        card();
    });
    btn.click();
    function shuffle() {
        let msg = [ '카', '카', '드', '드', '짝', '짝', '맞', '맞', '추', '추', '기', '기'];
        let msg_pos = [];
        while(msg_pos.length < hor*ver) {
            msg_pos.push(msg.splice(Math.floor(Math.random() * msg.length), 1)[0]);
        }
        return msg_pos;
    }
    function card() {
        btn.disabled = true;
        flag_click = false;
        let msg_pos = shuffle();
        let cards = document.querySelector('.cards');
        cards.innerHTML = '';
        for(let i=0; i<hor*ver; i++) {
            let d = document.createElement('div');
            d.classList.add('card');
            let f = document.createElement('div');
            f.classList.add('card_front');
            let b = document.createElement('div');
            b.classList.add('card_back');
            let h = document.createElement('h1');
            h.textContent = msg_pos[i];
            b.appendChild(h);
            d.appendChild(f);
            d.appendChild(b);
            cards.appendChild(d);
            d.addEventListener('click', function() {
                if(flag_click && !click_card.includes(d) && !d.classList.contains('flipped')) {
                    click_card.push(d);
                    d.classList.add('flipped');
                    if(click_card.length === 2) {
                        flag_click = false;
                        if(click_card[0].childNodes[1].childNodes[0].textContent !== click_card[1].childNodes[1].childNodes[0].textContent) {
                            setTimeout(function() {
                                click_card[0].classList.remove('flipped');
                                click_card[1].classList.remove('flipped');
                                click_card = [];
                                flag_click = true;
                            }, 1000);
                        } else {
                            open_count += 2;
                            if(open_count === hor*ver) {
                                flag_click = false;
                                setTimeout(function() {
                                    alert('성공');
                                }, 1000);
                            } else {
                                flag_click = true;
                            }
                            click_card = [];
                        }
                    }
                }
            });
        }
        setTimeout(function() {
            document.querySelectorAll('.card').forEach(function(item, index) {
                setTimeout(function() {
                    item.classList.add('flipped');
                }, 100*index);
            });
        }, 1000);
        setTimeout(function() {
            document.querySelectorAll('.card').forEach(function(item, index) {
                item.classList.remove('flipped');
                flag_click = true;
                btn.disabled = false;
            });
        }, 4000);
    }
}
