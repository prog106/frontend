'use strict';

function Tetris() {
    let tetris = document.querySelector('#tetris');
    function init() {
        let fragment = document.createDocumentFragment();
        for(let i=0; i<20; i++) {
            let tr = document.createElement('tr');
            fragment.appendChild(tr);
            for(let j=0; j<10; j++) {
                let td = document.createElement('td');
                tr.appendChild(td);
            }
        }
        tetris.appendChild(fragment);
    }
    init();
    window.addEventListener('keydown', function(event) {
        switch(event.code) {
            case "ArrowLeft": // <<
            break;
            case "ArrowRight": // >>
            break;
            case "ArrowDown": // 내리기
            break;
            default: // 반응없음
            break;
        }
    });
    window.addEventListener('keyup', function(event) {
        switch(event.code) {
            case "ArrowUp": // 회전
            break;
            case "Space": // 완전 내리기
            break;
            default: // 반응없음
            break;
        }
    });
}
