'use strict';
let screen = document.querySelector('#screen');

let start;
let end;
let timer;
screen.addEventListener('click', function() {
    if(screen.classList.contains('waiting')) {
        screen.classList.remove('waiting');
        screen.classList.add('ready');
        screen.textContent = '초록색이 되면 클릭하세요.';
        timer = setTimeout(function() {
            screen.click();
            start = new Date();
        }, Math.floor((Math.random() * 1000) + 2000));
    } else if(screen.classList.contains('ready')) {
        if(!start) clearTimeout(timer);
        else {
            screen.classList.remove('ready');
            screen.classList.add('now');
            screen.textContent = '클릭하세요.';
        }
    } else if(screen.classList.contains('now')) {
        screen.classList.remove('now');
        screen.classList.add('waiting');
        screen.textContent = '클릭해서 시작하세요.';
        end = new Date();
        let time = end - start;
        start = null;
        end = null;
        console.log(time/1000 + ' sec');
    }
});
