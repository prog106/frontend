let Bookshelf = function() {
    let book_data = [];
    function getinfo() {
        let url = '/bookshelf/getinfo';
        let form_data = new FormData();
        form_data.append('shelf_code', document.querySelector('input[name=shelf_code]').value);
        common.ax_fetch_post(url, form_data, function(res) {
            if(res.success) {
                book_data = res.data;
                let bhtml = '';
                res.data.forEach(function(v, k) {
                    bhtml += `<li class="book_info">
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
                            <div class="book_link"><a href="${v.link}" target="_blank">책 상세보기</a></div>
                            <div class="book_button">
                                <button class="add_book" data-isbn13="${v.isbn13}">내 책장에 담기 +</button>
                            </div>
                        </div>
                    </li>`;
                });
                document.querySelector('.shelf_name').textContent = res.info.shelf_name;
                document.querySelector('.shelf_list').insertAdjacentHTML('beforeend', bhtml);
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    function menu() {
        document.querySelectorAll('.menu_title').forEach(function(item) {
            item.addEventListener('click', function() {
                document.querySelector('.shelf_list').innerHTML = '';
                let status = item.dataset.status;
                document.querySelectorAll('.menu_title').forEach(function(menu) {
                    menu.classList.remove('active');
                    if(menu.dataset.status == status) menu.classList.add('active');
                });
                let bhtml = '';
                book_data.forEach(function(v, k) {
                    if(status != 'all' && v.status != status) return true;
                    bhtml += `<li class="book_info">
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
                            <div class="book_link"><a href="${v.link}" target="_blank">책 상세보기</a></div>
                            <div class="book_button">
                                <button class="add_book" data-isbn13="${v.isbn13}">내 책장에 담기 +</button>
                            </div>
                        </div>
                    </li>`;
                });
                setTimeout(function() {
                    document.querySelector('.shelf_list').insertAdjacentHTML('beforeend', bhtml);
                }, 100);
            });
        });
    }
    return {
        init: function() {
            console.log('init');
            getinfo();
            menu();
        }(),
    }
}();
