let Myshelf = function() {
    let fetch = false;
    let book_data = [];
    function getpoint(season='') {
        let url = `/user/point${(season)?'/'+season:''}`;
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                document.querySelector('.point').innerHTML = `포인트 <span>${res.point}P</span>`;
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
            }
        });
    }
    function getinfo(status='all', season='') {
        let url = `/myshelf/info${(season)?'/'+season:''}`;
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                book_data = res.data;
                document.querySelector('.txt_all').textContent = `(${res.info.all})`;
                document.querySelector('.txt_ready').textContent = `(${res.info.ready})`;
                document.querySelector('.txt_start').textContent = `(${res.info.start})`;
                document.querySelector('.txt_complete').textContent = `(${res.info.complete})`;
                document.querySelectorAll('.menu_title').forEach(function(item) {
                    item.classList.remove('active');
                    if(item.dataset.status == status) {
                        item.classList.add('active');
                        scrollmenu(item.parentNode);
                    }
                });
                let bhtml = '<li class="book_info"><div class="book_nodata">"가족 책장"에서 책을 가져올 수 있습니다.</div></li>';
                if(book_data.length > 0) {
                    bhtml = book_data.filter(function(item) {
                        let ret = false;
                        if(status == 'complete') {
                            if(item.mybook_status == 'request' || item.mybook_status == 'complete') ret = true;
                        } else {
                            if(item.mybook_status == status || status == 'all') ret = true;
                        }
                        return ret;
                    }).map(item => bookhtml(item)).join('');
                }
                setTimeout(function() {
                    document.querySelector('.myshelf_list').innerHTML = bhtml;
                }, 100);
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
            }
        });
    }
    function scrollmenu(item) {
        let t = 0;
        let pos = 0;
        document.querySelectorAll('li.menu').forEach(function(v, k) {
            if(k > 0) t += v.offsetWidth;
            if(v == item) pos = t - v.offsetWidth;
        });
        document.querySelector('.myshelf_menu_group').scrollTo({ left: pos, behavior: 'smooth' });
    }
    function menu() {
        document.querySelectorAll('.menu_title').forEach(function(item) {
            item.addEventListener('click', function() {
                scrollmenu(item.parentNode);
                document.querySelector('.myshelf_list').innerHTML = '';
                let status = item.dataset.status;
                document.querySelectorAll('.menu_title').forEach(function(menu) {
                    menu.classList.remove('active');
                    if(menu.dataset.status == status) menu.classList.add('active');
                });
                let bhtml = '<li class="book_info"><div class="book_nodata">"가족 책장"에서 책을 가져올 수 있습니다.</div></li>';
                if(book_data.length > 0) {
                    bhtml = book_data.filter(function(item) {
                        let ret = false;
                        if(status == 'complete') {
                            if(item.mybook_status == 'request' || item.mybook_status == 'complete') ret = true;
                        } else {
                            if(item.mybook_status == status || status == 'all') ret = true;
                        }
                        return ret;
                    }).map(item => bookhtml(item)).join('');
                }
                setTimeout(function() {
                    document.querySelector('.myshelf_list').insertAdjacentHTML('beforeend', bhtml);
                }, 100);
            });
        });
    }
    function changeinfo(code, isbn13) {
        if(fetch) return false;
        fetch = true;
        let book = book_data.filter(item => (item.isbn13 == isbn13));
        let url = '/myshelf/info';
        let form_data = new FormData();
        form_data.append('code', code);
        form_data.append('book', JSON.stringify(book));
        common.ax_fetch_put(url, form_data, function(res) {
            fetch = false;
            if(res.success) {
                getinfo(code);
                if(code == 'complete') getpoint();
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
            }
        });
    }
    function bookhtml(item) {
        let icon = `<span class="point">${item.mybook_point} 포인트</span>`;
        let btn = `<button class="read_start" onclick="Myshelf.changeinfo('start', ${item.isbn13});">읽기 시작했어요</button>`;
        let stamp = '';
        if(item.mybook_status == 'ready') icon += '<span>아직 읽지 않았어요</span>';
        else if(item.mybook_status == 'start') {
            icon += '<span>읽고 있어요</span>';
            btn = `<button class="read_complete" onclick="Myshelf.changeinfo('complete', ${item.isbn13});">모두 읽었어요</button>`;
        } else if(item.mybook_status == 'request') {
            icon += '<span>모두 읽었어요!</span>';
            btn = `<button onclick="common.notification('부모님 확인중이에요. 잠시만 기다려 주세요.');">부모님 확인중입니다.</button>`;
        } else if(item.mybook_status == 'complete') {
            icon = '<span>모두 읽었어요!</span>';
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
                <div class="book_title" onclick="Myshelf.myshelf_mod(${item.isbn13});">${item.title.replace(/<[^>]*>?/gm, '')}</div>
                <div class="book_isbn">ISBN : <span>${item.isbn13}</span></div>
                <div class="book_author">저자 : <span>${item.authors.split('|').join(', ').replace(/<[^>]*>?/gm, '')}</span></div>
                <div class="book_translator">번역 : <span>${item.translators.split('|').join(', ').replace(/<[^>]*>?/gm, '')}</span></div>
                <div class="book_publisher">출판 : <span>${item.publisher.split('|').join(', ').replace(/<[^>]*>?/gm, '')}</span></div>
                <div class="book_regdate">${item.regdate}</div>
                <div class="book_link"><a href="${item.link}" target="_blank">Daum 책 소개</a></div>
                <div class="book_button">${btn}</div>
            </div>
        </li>`;
    }
    function changeseason() {
        document.querySelector('select[name=season]').addEventListener('change', function() {
            getpoint(this.options[this.selectedIndex].value);
            getinfo('all', this.options[this.selectedIndex].value);
        });
    }
    function myshelf_mod(isbn13) {
        let book = book_data.filter(item => (item.isbn13 == isbn13))[0];
        setTimeout(function() {
            document.querySelector('.layer_modal').style.display = 'flex';
            let mod_wrap = document.querySelector('.myshelf_mod_wrap');
            mod_wrap.style.display = 'block';
            mod_wrap.querySelector('input[name=isbn13]').value = isbn13;
            mod_wrap.querySelector('.myshelf_mod_info').innerHTML = book.title;
            mod_wrap.querySelector('.member_del_button').style.display = (book.mybook_status == 'complete') ? 'none' : '';
            // mod_wrap.querySelector('.member_mod_picture_preview').src = item.querySelector('img').src;
            // mod_wrap.querySelector('input[name=user_name]').value = item.querySelector('.name').textContent;
        }, 200);
    }
    function myshelf_mod_modal() {
        document.querySelector('.myshelf_mod_btn').addEventListener('click', function() {
            if(fetch) return false;
            fetch = true;
            let url = myshelf_mod_form.action;
            let form_data = new FormData(myshelf_mod_form);
            form_data.append('book', JSON.stringify(book_data.filter(item => (item.isbn13 == document.querySelector('input[name=isbn13]').value))));
            common.ax_fetch_put(url, form_data, function(res) {
                fetch = false;
                if(res.success) {
                    if(res.message) common.notification(res.message, 20);
                    getinfo();
                    setTimeout(function() {
                        document.querySelector('.myshelf_mod_wrap .close').click();
                    }, 100);
                } else {
                    if(res.message) alert(res.message);
                    if(res.code == 'reload') common.reload();
                    if(res.code == 'logout') common.logout();
                    if(res.code == 'choose') common.choose();
                }
            });
        });
        document.querySelector('.myshelf_del_btn').addEventListener('click', function() {
            if(!confirm('주의!\n삭제 후 복구가 불가능합니다.\n내 책꽂이에서 삭제하시겠습니까?')) return false;
            if(fetch) return false;
            fetch = true;
            let url = myshelf_mod_form.action;
            let form_data = new FormData();
            form_data.append('book', JSON.stringify(book_data.filter(item => (item.isbn13 == document.querySelector('input[name=isbn13]').value))));
            common.ax_fetch_delete(url, form_data, function(res) {
                fetch = false;
                if(res.success) {
                    if(res.message) common.notification(res.message, 20);
                    getinfo();
                    setTimeout(function() {
                        document.querySelector('.myshelf_mod_wrap .close').click();
                    }, 100);
                } else {
                    if(res.message) alert(res.message);
                    if(res.code == 'reload') common.reload();
                    if(res.code == 'logout') common.logout();
                    if(res.code == 'choose') common.choose();
                }
            });
        });
    }
    function myshelf_modal_close() {
        let layer_modal = document.querySelector('.layer_modal');
        layer_modal.querySelector('.myshelf_mod_wrap .close').addEventListener('click', function() {
            setTimeout(function() {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.myshelf_mod_wrap').style.display = 'none';
            }, 200);
        });
        window.onclick = function(event) {
            if(event.target == layer_modal) {
                setTimeout(function() {
                    layer_modal.style.display = 'none';
                    layer_modal.querySelector('.myshelf_mod_wrap').style.display = 'none';
                }, 200);
            }
        }
    }
    return {
        init: function() {
            getpoint();
            getinfo();
            menu();
            changeseason();
            myshelf_mod_modal();
            myshelf_modal_close();
        }(),
        changeinfo: changeinfo,
        myshelf_mod: myshelf_mod,
    }
}();
