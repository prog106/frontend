'use strict';

function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.style.left = Math.random() * 100 + "vw";
    let sec = Math.random() * 2 + 3;
    heart.style.animationDuration = sec + "s";
    heart.textContent = '🥕';
    document.body.appendChild(heart);
    setTimeout(function() {
        heart.remove();
    }, sec*1000);
}

setInterval(createHeart, 300);
