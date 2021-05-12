let Kid_myshelf = function() {
    let book_data = [];
    function getinfo() {
        let url = '/myshelf/info';
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                book_data = res.data;
                let bhtml = book_data.map(item => bookhtml(item)).join('');
                document.querySelector('.kid_myshelf_list').innerHTML = bhtml;
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
            }
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
                getinfo();
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function bookhtml(item) {
        let icon = '';
        let btn = `<button class="read_start" onclick="Kid_myshelf.changeinfo('start', ${item.isbn13});">읽기 시작했어요</button>`;
        let stamp = ``;
        if(item.mybook_status == 'ready') icon += '<span>아직 읽지 않았어요</span>';
        if(item.mybook_status == 'start') {
            icon += '<span>읽고 있어요.</span>';
            btn = `<button class="read_complete" onclick="Kid_myshelf.changeinfo('complete', ${item.isbn13});">모두 읽었어요</button>`;
        }
        if(item.mybook_status == 'request') {
            icon += '<span>모두 읽었어요!</span>';
            btn = `<button onclick="alert('부모님 확인중이에요.\\n\\n잠시만 기다려 주세요.');">부모님 확인중입니다.</button>`;
        }
        if(item.mybook_status == 'complete') {
            icon += '<span>모두 읽었어요!</span>';
            btn = ``;
            switch(item.mybook_stamp) {
                case "standard": stamp = `<div class="stamp animate"><span><span style="font-size:22px;">+${item.mybook_point}P</span>참 잘했어요!</span></div>`; break;
            }
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
            getinfo();
        }(),
        changeinfo: changeinfo,
    }
}();
