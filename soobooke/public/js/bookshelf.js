let Bookshelf = function() {
    let book_data = [];
    let shelf_name = '';
    function getinfo() {
        let url = '/bookshelf/info';
        let form_data = new FormData();
        form_data.append('shelf_code', document.querySelector('input[name=shelf_code]').value);
        common.ax_fetch_get(url, form_data, function(res) {
            if(res.success) {
                book_data = res.data;
                shelf_name = res.info.shelf_name;
                let bhtml = book_data.map(item => bookhtml(item)).join('');
                document.querySelector('.shelf_name').innerHTML = res.info.shelf_name + ' <i class="fas fa-chevron-right"></i>';
                // document.querySelector('.shelf_list').insertAdjacentHTML('beforeend', bhtml);
                document.querySelector('.shelf_list').innerHTML = bhtml;
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
                let bhtml = book_data.filter(item => (item.status == status || status == 'all')).map(item => bookhtml(item)).join('');
                setTimeout(function() {
                    document.querySelector('.shelf_list').insertAdjacentHTML('beforeend', bhtml);
                }, 100);
            });
        });
    }
    function bookhtml(item) {
        let status_icon = '<span>'+shelf_name+'</span>';
        if(item.status == 'complete') status_icon += '<span>모두 읽은 책</span>';
        if(item.status == 'read') status_icon += '<span>읽고 있는 책</span>';
        if(item.status == 'ready') status_icon += '<span>읽고 싶은 책</span>';
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
                <div class="book_status">${status_icon}</div>
                <div class="book_title">${item.title}</div>
                <div class="book_isbn">ISBN : <span>${item.isbn13}</span></div>
                <div class="book_author">저자 : <span>${item.authors}</span></div>
                <div class="book_translator">번역 : <span>${item.translators}</span></div>
                <div class="book_publisher">출판 : <span>${item.publisher}</span></div>
                <div class="book_regdate">${item.regdate}</div>
                <div class="book_link"><a href="${item.link}" target="_blank">책 상세보기</a></div>
                <div class="book_button">
                    <!-- button class="changeshelf" onclick="Bookshelf.changeshelf();">책꽂이 선택</button -->
                    <button class="sendletter" onclick="javascript:;">책 편지 보내기</button>
                    <button class="changestatus" onclick="bookshelf.changestatus();">읽은 상태 선택</button>
                </div>
            </div>
        </li>`;
    }
    function shelf_modal_close() {
        let layer_modal = document.querySelector('.layer_modal');
        layer_modal.querySelector('.moveshelf_wrap .close').addEventListener('click', function() {
            layer_modal.style.display = 'none';
            layer_modal.querySelector('.moveshelf_wrap').style.display = 'none';
        });
        layer_modal.querySelector('.changeshelf_wrap .close').addEventListener('click', function() {
            layer_modal.style.display = 'none';
            layer_modal.querySelector('.changeshelf_wrap').style.display = 'none';
        });
        layer_modal.querySelector('.changestatus_wrap .close').addEventListener('click', function() {
            layer_modal.style.display = 'none';
            layer_modal.querySelector('.changestatus_wrap').style.display = 'none';
        });
        window.onclick = function(event) {
            if(event.target == layer_modal) {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.moveshelf_wrap').style.display = 'none';
                layer_modal.querySelector('.changeshelf_wrap').style.display = 'none';
                layer_modal.querySelector('.changestatus_wrap').style.display = 'none';
            }
        }
    }
    return {
        init: function() {
            getinfo();
            menu();
            // shelf_modal();
            shelf_modal_close();
        }(),
        getinfo: getinfo,
        shelf_modal: function() {
            document.querySelector('.layer_modal').style.display = 'flex';
            document.querySelector('.moveshelf_wrap').style.display = 'block';
        },
        changeshelf: function() {
            document.querySelector('.layer_modal').style.display = 'flex';
            document.querySelector('.changeshelf_wrap').style.display = 'block';
        },
        changestatus: function() {
            document.querySelector('.layer_modal').style.display = 'flex';
            document.querySelector('.changestatus_wrap').style.display = 'block';
        },
    }
}();
