let Bookshelf = function() {
    let fetch = false;
    let book_data = [];
    function shelfclass() {
        let url = '/bookshelf/shelfclass';
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                let shtml = '<option value="기타">기타</option>';
                res.data.forEach(function(v, k) {
                    shtml += `<option value="${v.shelf_name}">${v.shelf_name}</option>`;
                });
                document.querySelector('select[name=shelfclass_name]').insertAdjacentHTML('beforeend', shtml);
                getinfo();
            } else {
                if(res.message) common.notification(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function getinfo() {
        let url = '/bookshelf/info';
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                book_data = res.data;
                let shelfclass_name = document.querySelector('select[name=shelfclass_name]');
                let shelfclass_value = shelfclass_name.options[shelfclass_name.selectedIndex].value;
                let bhtml = book_data.filter(function(item) {
                    return (item.shelf_name.indexOf(shelfclass_value) != -1);
                }).map(item => bookhtml(item)).join('');
                document.querySelector('.shelf_list').innerHTML = bhtml;
            } else {
                if(res.message) common.notification(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function search() {
        let shelfclass_name = document.querySelector('select[name=shelfclass_name]');
        let shelfclass_value = shelfclass_name.options[shelfclass_name.selectedIndex].value;

        let value = document.querySelector('input[name=bookshelf_keyword]').value;
        document.querySelector('.remove_keyword').style.display = (value) ? 'inline-block' : 'none';
        let keyword = Hangul.disassemble(value).join('');

        let bhtml = book_data.filter(function(item) {
            return (item.shelf_name.toLowerCase().indexOf(shelfclass_value.toLowerCase()) != -1);
        }).filter(function(item) {
            return (Hangul.disassemble(item.title.replace(/(<([^>]+)>)/ig,"")).join('').toLowerCase().indexOf(keyword.toLowerCase()) != -1);
        }).map(item => bookhtml(item)).join('');
        document.querySelector('.shelf_list').innerHTML = bhtml;
    }
    function bookshelf_search() {
        document.querySelector('select[name=shelfclass_name]').addEventListener('change', function() {
            search();
        });
        let search_form = document.querySelector('input[name=bookshelf_keyword]');
        let remove_btn = document.querySelector('.remove_keyword');
        search_form.value = '';
        search_form.addEventListener('keyup', function() {
            search();
        });
        remove_btn.addEventListener('click', function() {
            search_form.value = '';
            remove_btn.style.display = 'none';
            search();
        });
    }
    function move_myshelf(isbn13) {
        if(fetch) return false;
        fetch = true;
        let book = book_data.filter(item => (item.isbn13 == isbn13));
        let url = '/bookshelf/info';
        let form_data = new FormData();
        form_data.append('book', JSON.stringify(book));
        common.ax_fetch_post(url, form_data, function(res) {
            fetch = false;
            if(res.success) {
                common.notification(res.message);
            } else {
                if(res.message) common.notification(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function bookhtml(item) {
        let icon = `<span>${item.book_point} 포인트</span> <span class="shelfclass_name">${item.shelf_name}</span>`;
        return `<li class="book_info">
            <div class="book_image">
                <img src="${item.thumbnail}" alt="">
                <div class="book_icon">
                    <a href="${item.link}" target="_blank">상세보기</a>
                    <!-- button class="bookdetail"><i class="fas fa-search-plus"></i></button>
                    <button class="sendbookpost"><i class="fas fa-envelope"></i></button -->
                </div>
            </div>
            <div class="book_subinfo">
                <div class="book_status">${icon}</div>
                <div class="book_title">${item.title.replace(/<[^>]*>?/gm, '')}</div>
                <div class="book_isbn">ISBN : <span>${item.isbn13}</span></div>
                <div class="book_author">저자 : <span>${item.authors}</span></div>
                <div class="book_translator">번역 : <span>${item.translators}</span></div>
                <div class="book_publisher">출판 : <span>${item.publisher}</span></div>
                <div class="book_regdate">${item.regdate}</div>
                <div class="book_link"><a href="${item.link}" target="_blank">책 상세보기</a></div>
                <div class="book_button">
                    <button class="move_myshelf" onclick="Bookshelf.move_myshelf('${item.isbn13}');">내 책꽂이로 옮기기</button>
                </div>
            </div>
        </li>`;
    }
    return {
        init: function() {
            shelfclass();
            bookshelf_search();
        }(),
        getinfo: getinfo,
        move_myshelf: move_myshelf,
    }
}();
