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
    golnbsearch: function() {
        common.lnbclose();
        common.lnbsearch();
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
    lnbsearch: function() {
        setTimeout(function() {
            document.querySelector('.modal').style.display = 'block';
            document.querySelector('.modal .book_search_modal').style.display = 'block';
            document.querySelector('.wrap').style.display = 'none';
            document.querySelector('input[name=keyword]').value = '';
            document.querySelector('input[name=keyword]').focus();
        }, 200);
    },
    lnbsearchclose: function() {
        setTimeout(function() {
            document.querySelector('.modal').style.display = 'none';
            document.querySelector('.modal .book_search_modal').style.display = 'none';
            document.querySelector('.wrap').style.display = 'block';
            document.querySelector('input[name=keyword]').value = '';
            document.querySelector('.book_search_list').innerHTML = '';
            document.querySelector('.book_search_nodata').style.display = 'flex';
            if(window.location.pathname == '/bookshelf' && Bookshelf) Bookshelf.getinfo();
        }, 200);
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
                    document.querySelector('.footer').classList.remove('slide_down');
                    document.querySelector('.gotop').classList.remove('slide_down');
                } else { // 아래로 스크롤
                    document.querySelector('.header').classList.add('slide_up');
                    document.querySelector('.footer').classList.add('slide_down');
                    document.querySelector('.gotop').classList.add('slide_down');
                }
            } else {
                document.querySelector('.header').classList.remove('slide_up');
                document.querySelector('.footer').classList.remove('slide_down');
                document.querySelector('.gotop').classList.remove('slide_down');
            }
            y = window.scrollY;
            if(y < 10) document.querySelector('.gotop').classList.remove('on');
            else document.querySelector('.gotop').classList.add('on');
        });
    }
    function booksearch(page=1) {
        if(fetch) return false;
        fetch = true;
        // form 데이터 처리
        let form_data = new FormData(search_book_form);
        form_data.append('page', page);
        let url = search_book_form.action;
        let shtml = '';
        common.ax_fetch_put(url, form_data, function(res) {
            fetch = false;
            if(res.data.length > 0) {
                if(page == 1) {
                    book_data = [];
                    document.querySelector('.book_search_list').innerHTML = '';
                    shtml += '<li class="book_info">검색 결과 ( ' + res.info.total_count + ' )</li>';
                }
                book_data = book_data.concat(res.data);
                res.data.forEach(function(v, k) {
                    shtml += `<li class="book_info">
                        <div class="book_image">
                            <img src="${v.thumbnail}" alt="">
                        </div>
                        <div class="book_subinfo">
                            <div class="book_title">${v.title}</div>
                            <div class="book_isbn">ISBN : <span>${v.isbn13}</span></div>
                            <div class="book_author">저자 : <span>${v.authors}</span></div>
                            <div class="book_translator">번역 : <span>${v.translators}</span></div>
                            <div class="book_publisher">출판 : <span>${v.publisher}</span></div>
                            <div class="book_regdate">${v.regdate}</div>
                            <div class="book_link"><a href="${v.link}" target="_blank">책 소개</a></div>
                            <div class="book_button">
                                <button class="add_book" onclick="Commonjs.add_bookshelf(${v.isbn13})">우리 가족 책장에 담기 +</button>
                            </div>
                        </div>
                    </li>`;
                });
                document.querySelector('.book_search_nodata').style.display = 'none';
                page++;
                if(!res.info.is_end) shtml += `<li class="book_info more" onclick="Commonjs.booksearch(${page})">더 보기 +</li>`;
                if(document.querySelector('.book_info.more')) document.querySelector('.book_info.more').remove();
                document.querySelector('.book_search_list').insertAdjacentHTML('beforeend', shtml);
                if(document.querySelector('input[name=keyword]:focus')) document.querySelector(':focus').blur();
            } else {
                document.querySelector('.book_search_list').insertAdjacentHTML('beforeend', shtml);
            }
        });
    }
    function add_bookshelf(isbn13) {
        if(fetch) return false;
        fetch = true;
        let book = book_data.find(function(v) { if(v.isbn13 == isbn13) return true; });
        let url = '/bookshelf';
        let form_data = new FormData();
        form_data.append('book', JSON.stringify(book));
        common.ax_fetch_post(url, form_data, function(res) {
            fetch = false;
            if(res.success) {
                common.notification('우리 가족 책장에 담았습니다.', 20);
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    return {
        init: function() {
            scrolling();
        }(),
        booksearch: booksearch,
        add_bookshelf: add_bookshelf,
    }
}();
