let Bookstamp = function() {
    let book_data = [];
    function getmenu() {
        let url = '/bookstamp/menu';
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                let mhtml = res.data.map(item => menuhtml(item)).join('');
                document.querySelector('.bookstamp_menu').innerHTML = mhtml;
                menu();
            } else {
                if(res.message) common.notification(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function menuhtml(item) {
        return `<li class="menu">
            <div class="menu_info" data-user_idx="${item.user_idx}">
                <img src="${item.user_profile}">
                <span>${item.user_name}</span>
            </div>
        </li>`;
    }
    function menu() {
        document.querySelectorAll('.menu_info').forEach(function(item) {
            item.addEventListener('click', function() {
                document.querySelector('.bookstamp_list').innerHTML = '';
                let user_idx = item.dataset.user_idx;
                document.querySelectorAll('.menu_info').forEach(function(menu) {
                    menu.classList.remove('active');
                    if(menu.dataset.user_idx == user_idx) menu.classList.add('active');
                });
                let bhtml = book_data.filter(item => item.user_idx == user_idx).map(item => bookhtml(item)).join('');
                setTimeout(function() {
                    document.querySelector('.bookstamp_list').insertAdjacentHTML('beforeend', bhtml);
                }, 100);
            });
        });
    }
    function getinfo() {
        let url = '/bookstamp/info';
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                book_data = res.data;
                let bhtml = book_data.map(item => bookhtml(item)).join('');
                document.querySelector('.bookstamp_list').innerHTML = bhtml;
            } else {
                if(res.message) common.notification(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function bookhtml(item) {
        let icon = `<span>모두 읽었어요!</span>`;
        let stamp = `<div class="point">${item.mybook_point} 포인트</div> `;
        let btn = `<button onclick="Bookstamp.stamp(${item.mybook_idx});">도장 찍어주기</button>`;
        return `<li class="book_info">
            <div class="book_image">
                <img src="${item.thumbnail}" alt="">
                ${stamp}
            </div>
            <div class="book_subinfo">
                <div class="book_status">${icon}</div>
                <div class="book_title">${item.title}</div>
                <div class="book_isbn">ISBN : <span>${item.isbn13}</span></div>
                <div class="book_author">저자 : <span>${item.authors}</span></div>
                <div class="book_translator">번역 : <span>${item.translators}</span></div>
                <div class="book_publisher">출판 : <span>${item.publisher}</span></div>
                <div class="book_regdate">${item.regdate}</div>
                <div class="book_link"><a href="${item.link}" target="_blank">Daum 책 소개</a></div>
                <div class="book_button">${btn}</div>
            </div>
        </li>`;
    }
    function stamp(mybook) {
        common.notification('도장 꽝!' + mybook, 10);
        let book = book_data.filter(item => (item.isbn13 == isbn13));
        let url = '/myshelf/info';
        let form_data = new FormData();
        form_data.append('code', code);
        form_data.append('book', JSON.stringify(book));
        common.ax_fetch_put(url, form_data, function(res) {
            if(res.success) {
                getinfo();
            } else {
                if(res.message) common.notification(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    return {
        init: function() {
            getmenu();
            getinfo();
        }(),
        stamp: stamp,
    }
}();
