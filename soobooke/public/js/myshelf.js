let Myshelf = function() {
    let book_data = [];
    function getpoint() {
        let url = '/user/point';
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                document.querySelector('.point').innerHTML = '포인트 <span>' + res.point + 'P</span>';
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function getinfo() {
        let url = '/myshelf/info';
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                book_data = res.data;
                let bhtml = book_data.map(item => bookhtml(item)).join('');
                document.querySelector('.myshelf_list').innerHTML = bhtml;
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function menu() {
        document.querySelectorAll('.menu_title').forEach(function(item) {
            item.addEventListener('click', function() {
                document.querySelector('.myshelf_list').innerHTML = '';
                let status = item.dataset.status;
                document.querySelectorAll('.menu_title').forEach(function(menu) {
                    menu.classList.remove('active');
                    if(menu.dataset.status == status) menu.classList.add('active');
                });
                let bhtml = book_data.filter(function(item) {
                    let ret = false;
                    if(status == 'complete') {
                        if(item.mybook_status == 'request' || item.mybook_status == 'complete') ret = true;
                    } else {
                        if(item.mybook_status == status || status == 'all') ret = true;
                    }
                    return ret;
                }).map(item => bookhtml(item)).join('');
                setTimeout(function() {
                    document.querySelector('.myshelf_list').insertAdjacentHTML('beforeend', bhtml);
                }, 100);
            });
        });
    }
    function changeinfo(code, isbn13) {
        let book = book_data.filter(item => (item.isbn13 == isbn13));
        let url = '/myshelf/info';
        let form_data = new FormData();
        form_data.append('code', code);
        form_data.append('book', JSON.stringify(book));
        common.ax_fetch_put(url, form_data, function(res) {
            if(res.success) {
                if(res.code == 'reload') common.reload(); else getinfo();
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function bookhtml(item) {
        let icon = ``;
        let btn = `<button class="read_start" onclick="Myshelf.changeinfo('start', ${item.isbn13});">읽기 시작했어요</button>`;
        let stamp = `<div class="point">${item.mybook_point} 포인트</div> `;
        if(item.mybook_status == 'ready') icon += '<span>아직 읽지 않았어요</span>';
        else if(item.mybook_status == 'start') {
            icon += '<span>읽고 있어요</span>';
            btn = `<button class="read_complete" onclick="Myshelf.changeinfo('complete', ${item.isbn13});">모두 읽었어요</button>`;
        } else if(item.mybook_status == 'request') {
            icon += '<span>모두 읽었어요!</span>';
            btn = `<button onclick="common.notification('부모님 확인중이에요. 잠시만 기다려 주세요.');">부모님 확인중입니다.</button>`;
        } else if(item.mybook_status == 'complete') {
            icon += '<span>모두 읽었어요!</span>';
            btn = ``;
            stamp = `<div class="stamp animate ${item.mybook_stamp}"><span><span style="font-size:22px;">+${item.mybook_point}P</span>참 잘했어요!</span></div>`;
        }
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
    return {
        init: function() {
            getpoint();
            getinfo();
            menu();
        }(),
        changeinfo: changeinfo,
    }
}();
