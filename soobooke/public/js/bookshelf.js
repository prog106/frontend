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
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
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
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
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
            return (item.shelf_name.replace(/ /g,"").toLowerCase().indexOf(shelfclass_value.replace(/ /g,"").toLowerCase()) != -1);
        }).filter(function(item) {
            return (Hangul.disassemble(item.title.replace(/(<([^>]+)>)/ig,"").replace(/ /g,"")).join('').toLowerCase().indexOf(keyword.toLowerCase()) != -1);
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
    function move_myshelf(isbn13, btn) {
        if(fetch) return false;
        fetch = true;
        let book = book_data.filter(item => (item.isbn13 == isbn13));
        let url = '/bookshelf/info';
        let form_data = new FormData();
        form_data.append('book', JSON.stringify(book));
        common.ax_fetch_post(url, form_data, function(res) {
            fetch = false;
            if(res.success) {
                common.notification(res.message, 20);
                btn.innerHTML = '내 책꽂이로 이동 되었습니다.';
                btn.onclick = null;
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
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
                <div class="book_title">${item.title.replace(/<[^>]*>?/gm, '')}</div>
                <div class="book_status">${icon}</div>
                <div class="book_isbn">ISBN : <span>${item.isbn13}</span></div>
                <div class="book_author">저자 : <span>${item.authors.split('|').join(', ')}</span></div>
                <div class="book_translator">번역 : <span>${item.translators.split('|').join(', ')}</span></div>
                <div class="book_publisher">출판 : <span>${item.publisher.split('|').join(', ')}</span></div>
                <div class="book_regdate">${item.regdate}</div>
                <div class="book_link"><a href="${item.link}" target="_blank">책 상세보기</a></div>
                <div class="book_button">
                    ${(item.mybook)?`<button class="move_myshelf" onclick="javascript:;">내 책꽂이에 있는 책입니다.</button>`:`<button class="move_myshelf" onclick="Bookshelf.move_myshelf('${item.isbn13}', this);">내 책꽂이로 옮기기 +</button>`}
                </div>
            </div>
        </li>`;
    }
    function bookshelf_modal() {
        document.querySelector('.bookshelf_add').addEventListener('click', function() {
            setTimeout(function() {
                document.querySelector('.modal').style.display = 'block';
                document.querySelector('.modal .book_search_modal').style.display = 'block';
                document.querySelector('.wrap').style.display = 'none';
                document.querySelector('input[name=keyword]').value = '';
                document.querySelector('input[name=keyword]').focus();
            }, 200);
        });
        document.querySelector('.modal .book_search .close').addEventListener('click', function() {
            setTimeout(function() {
                document.querySelector('.modal').style.display = 'none';
                document.querySelector('.modal .book_search_modal').style.display = 'none';
                document.querySelector('.wrap').style.display = 'block';
                document.querySelector('input[name=keyword]').value = '';
                document.querySelector('.book_search_list').innerHTML = '';
                document.querySelector('.book_search_nodata').style.display = 'flex';
                getinfo();
            }, 200);
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
                    let thumbnail = v.thumbnail.replace('type=m1&', 'type=m140&');
                    shtml += `<li class="book_info">
                        <div class="book_image">
                            <img src="${thumbnail}" alt="">
                        </div>
                        <div class="book_subinfo">
                            <div class="book_title">${v.title.replace(/<[^>]*>?/gm, '')}</div>
                            <div class="book_isbn">ISBN : <span>${v.isbn13}</span></div>
                            <div class="book_author">저자 : <span>${v.authors.split('|').join(', ')}</span></div>
                            <div class="book_translator">번역 : <span>${v.translators.split('|').join(', ')}</span></div>
                            <div class="book_publisher">출판 : <span>${v.publisher.split('|').join(', ')}</span></div>
                            <div class="book_regdate">${v.regdate}</div>
                            <div class="book_link"><a href="${v.link}" target="_blank">책 소개</a></div>
                            <div class="book_button">
                                <button class="add_book" onclick="Commonjs.add_bookshelf(${v.isbn13}, this)">우리 가족 책장에 담기 +</button>
                            </div>
                        </div>
                    </li>`;
                });
                document.querySelector('.book_search_nodata').style.display = 'none';
                page++;
                if(!res.info.is_end) shtml += `<li class="book_info more" onclick="Bookshelf.booksearch(${page})">더 보기 +</li>`;
                if(document.querySelector('.book_info.more')) document.querySelector('.book_info.more').remove();
                document.querySelector('.book_search_list').insertAdjacentHTML('beforeend', shtml);
                if(document.querySelector('input[name=keyword]:focus')) document.querySelector(':focus').blur();
            } else {
                document.querySelector('.book_search_list').insertAdjacentHTML('beforeend', shtml);
            }
        });
    }
    function add_bookshelf(isbn13, btn) {
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
                btn.innerHTML = '우리 가족 책장에 담았습니다.';
                btn.onclick = null;
            } else {
                if(res.code == 'already') {
                    btn.innerHTML = res.message;
                    btn.onclick = null;
                }
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
            }
        });
    }
    function booksearchtext() {
        let remove_btn = document.querySelector('form#search_book_form .remove_keyword');
        let keyword = document.querySelector('form#search_book_form input[name=keyword]');
        if(keyword.value) {
            remove_btn.style.display = 'inline-block';
        } else {
            remove_btn.style.display = 'none';
        }
    }
    function deletebooksearchtext() {
        document.querySelector('form#search_book_form input[name=keyword]').value = '';
        document.querySelector('form#search_book_form .remove_keyword').style.display = 'none';
    }
    return {
        init: function() {
            shelfclass();
            bookshelf_search();
            bookshelf_modal();
        }(),
        move_myshelf: move_myshelf,
        booksearchtext: booksearchtext,
        deletebooksearchtext: deletebooksearchtext,
        booksearch: booksearch,
        add_bookshelf: add_bookshelf,
    }
}();
