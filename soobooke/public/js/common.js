let book_data = [];
let common = {
    ax_fetch_post: function(url, data, callback) {
        fetch(url, {
            method: 'POST',
            body: data,
        })
        .then(response => response.json())
        .then(response => callback(response))
        .catch(error => console.error(error));
    },
    ax_fetch_put: function(url, data, callback) {
        fetch(url, {
            method: 'PUT',
            body: data,
        })
        .then(response => response.json())
        .then(response => callback(response))
        .catch(error => console.error(error));
    },
    ax_fetch_get: function(url, callback) {
        fetch(url, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(response => callback(response))
        .catch(error => console.error(error));
    },
    ax_fetch_delete: function(url, data, callback) {
        fetch(url, {
            method: 'DELETE',
            body: data,
        })
        .then(response => response.json())
        .then(response => callback(response))
        .catch(error => console.error(error));
    },
    home: function() {
        window.location.href = '/main';
    },
    lnb: function() {
        setTimeout(function() {
            document.querySelector('#nav').classList.add('active');
            document.querySelector('.dimmed').classList.add('on');
        }, 200);
    },
    lnbclose: function() {
        setTimeout(function() {
            document.querySelector('#nav').classList.remove('active');
            document.querySelector('.dimmed').classList.remove('on');
        }, 200);
    },
    login: function() {
        window.location.href = '/login';
    },
    choose: function() {
        window.location.href = '/choose';
    },
    info: function() {
        window.location.href = '/user/info';
    },
    manage: function() {
        window.location.href = '/user/manage';
    },
    shelfclass: function() {
        window.location.href = '/user/shelfclass';
    },
    logout: function() {
        setTimeout(function() {
            window.location.href = '/logout';
        }, 200);
    },
    signout: function() {
        window.location.href = '/user/signout';
    },
    bookshelf: function() {
        window.location.href = '/bookshelf';
    },
    myshelf: function() {
        window.location.href = '/myshelf';
    },
    bookstamp: function() {
        window.location.href = '/bookstamp';
    },
    stamp: function() {
        window.location.href = '/user/stamp';
    },
    badge: function() {
        window.location.href = '/user/badge';
    },
    recommend: function() {
        window.location.href = '/recommend';
    },
    kidpoint: function() {
        window.location.href = '/kids/point';
    },
    reload: function() {
        window.location.reload();
    },
    _gotop: function() {
        let duration = 500;
        // cancel if already on top
        if (document.scrollingElement.scrollTop === 0) return;
        const totalScrollDistance = document.scrollingElement.scrollTop;
        let scrollY = totalScrollDistance, oldTimestamp = null;
        function step (newTimestamp) {
            if (oldTimestamp !== null) {
                // if duration is 0 scrollY will be -Infinity
                scrollY -= totalScrollDistance * (newTimestamp - oldTimestamp) / duration;
                if (scrollY <= 0) return document.scrollingElement.scrollTop = 0;
                document.scrollingElement.scrollTop = scrollY;
            }
            oldTimestamp = newTimestamp;
            window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    },
    __gotop: function() {
        let duration = 500;
        // cancel if already on top
        if (document.scrollingElement.scrollTop === 0) return;
        const cosParameter = document.scrollingElement.scrollTop / 2;
        let scrollCount = 0, oldTimestamp = null;
        function step (newTimestamp) {
            if (oldTimestamp !== null) {
                // if duration is 0 scrollCount will be Infinity
                scrollCount += Math.PI * (newTimestamp - oldTimestamp) / duration;
                if (scrollCount >= Math.PI) return document.scrollingElement.scrollTop = 0;
                document.scrollingElement.scrollTop = cosParameter + cosParameter * Math.cos(scrollCount);
            }
            oldTimestamp = newTimestamp;
            window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    },
    gotop: function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    kakaologin: function() {
        setTimeout(function() {
            let agent = navigator.userAgent.toLowerCase();
            let safari = false;
            if(agent.indexOf("chrome") != -1 ){
            } else if (agent.indexOf("safari") != -1 ){
                safari = true;
            }
            if(safari) {
                window.location.href = '/auth/kakao';
                return false;
            }
            let kakao_auth_popup = '';
            if (!kakao_auth_popup.closed && kakao_auth_popup) {
                kakao_auth_popup.focus();
                return false;
            }
            let url = '/auth/kakao';
            kakao_auth_popup = window.open(url, 'kakao_login', 'width=400, height=680, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, scrollbar=no');
        }, 200);
    },
    googlelogin: function() {
        setTimeout(function() {
            window.location.href = '/auth/google';
        }, 200);
    },
    notification: function(message, sec) {
        if(document.querySelector('.notification')) document.querySelector('.notification').remove();
        let notification = document.createElement('div');
        notification.classList.add('notification');
        let span = document.createElement('span');
        span.classList.add('animate');
        span.innerText = message;
        notification.appendChild(span);
        document.body.appendChild(notification);
        notification.classList.add('on');
        let time = (sec) ? sec*100 : 3000;
        setTimeout(function() {
            notification.classList.remove('on');
        }, time);
    },
};
let Commonjs = function() {
    let fetch = false;
    function scrolling() {
        let y = window.scrollY;
        window.addEventListener('scroll', function() {
            if(window.scrollY > 40) {
                if(y > window.scrollY) { // 위로 스크롤
                    document.querySelector('.header').classList.remove('slide_up');
                    document.querySelector('.gotop').classList.remove('slide_down');
                } else { // 아래로 스크롤
                    document.querySelector('.header').classList.add('slide_up');
                    document.querySelector('.gotop').classList.add('slide_down');
                }
            } else {
                document.querySelector('.header').classList.remove('slide_up');
                document.querySelector('.gotop').classList.remove('slide_down');
            }
            y = window.scrollY;
            if(y < 10) document.querySelector('.gotop').classList.remove('on');
            else document.querySelector('.gotop').classList.add('on');
        });
    }
    return {
        init: function() {
            scrolling();
        }(),
    }
}();
