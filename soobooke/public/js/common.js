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
    home: function() {
        window.location.href = '/';
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
    member: function() {
        window.location.href = '/member';
    },
    info: function() {
        window.location.href = '/user/info';
    },
    manage: function() {
        window.location.href = '/user/member';
    },
    logout: function() {
        window.location.href = '/logout';
    },
    signout: function() {
        window.location.href = '/user/signout';
    },
    guide: function() {
        window.location.href = '/guide';
    },
    bookshelf: function() {
        window.location.href = '/bookshelf';
    },
    class: function() {
        window.location.href = '/bookshelf/class';
    },
    author: function() {
        window.location.href = '/author';
    },
    lnbsearch: function() {
        setTimeout(function() {
            document.querySelector('.modal').style.display = 'block';
            document.querySelector('.modal .book_search_modal').style.display = 'block';
            document.querySelector('.wrap').style.display = 'none';
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
        }, 200);
    },
    booksearch: function(page=1) {
        // form 데이터 처리
        let form_element = document.querySelector('form#search_book_form');
        let form_data = new FormData(form_element);
        form_data.append('page', page);
        let url = form_element.action;
        let shtml = '';
        common.ax_fetch_post(url, form_data, function(res) {
            if(res.data.length > 0) {
                if(page == 1) {
                    document.querySelector('.book_search_list').innerHTML = '';
                    shtml += '<li class="book_info">검색 결과</li>';
                }
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
                            <div class="book_link"><a href="${v.daum}" target="_blank">Daum 책 소개</a></div>
                            <div class="book_button">
                                <button class="add_book" data-isbn13="${v.isbn13}">내 책장에 담기 +</button>
                            </div>
                        </div>
                    </li>`;
                });
                document.querySelector('.book_search_nodata').style.display = 'none';
                page++;
                if(page < 51) shtml += `<li class="book_info more" onclick="common.booksearch(${page})">더 보기 +</li>`;
                if(page > 1 && page <= 51 && document.querySelector('.book_info.more')) document.querySelector('.book_info.more').remove();
                document.querySelector('.book_search_list').insertAdjacentHTML('beforeend', shtml);
                if(document.querySelector('input[name=keyword]:focus')) document.querySelector(':focus').blur();
            } else {
                document.querySelector('.book_search_list').insertAdjacentHTML('beforeend', shtml);
            }
        });
    },
    kakaologin: function() {
        setTimeout(function() {
            window.location.href = '/auth/kakao';
            // let kakao_auth_popup = '';
            // if (!kakao_auth_popup.closed && kakao_auth_popup) {
            //     kakao_auth_popup.focus();
            //     return false;
            // }
            // let url = '/auth/kakao';
            // kakao_auth_popup = window.open(url, 'kakao_login', 'width=400, height=680, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, scrollbar=no');
        }, 200);
    },
    googlelogin: function() {
        setTimeout(function() {
            window.location.href = '/auth/google';
        }, 200);
    },
    notification: function() {
        const notif = document.createElement('div');
        notif.classList.add('notification');
        notif.innerText = 'notification!!!!!!!';
        document.body.appendChild(notif);
        setTimeout(function() {
            notif.remove();
        }, 30000);
    },
};
