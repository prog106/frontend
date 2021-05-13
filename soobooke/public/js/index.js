function Soobooke(user) {
    let bookshelf = [];
    let bookinfo = {};
    function init() {
        if(user) {
            get_list();
            get_mylove();
            userinfo();
            add_mylove();
            kid_modal();
            del_book();
            send_book();
            search_book();
        } else {
            login();
        }
        menu_modal();
        book_modal();
    }
    function ax_fetch_post(url, data, callback) {
        fetch(url, {
            method: 'POST',
            body: data,
        })
        .then(response => response.json())
        .then(response => callback(response))
        .catch(error => console.error);
    }
    function send_book() {
        document.querySelector('.send_book').addEventListener('click', function(e) {
            let mylove = document.querySelector('#send_mylove').value;
            if(!bookinfo.isbn13) {
                common.notification('책이 없어요...');
                return false;
            }
            if(!mylove) {
                common.notification('받을 아이를 선택해 주세요.');
                return false;
            }
            e.preventDefault();
            let isbn = bookinfo.isbn13;
            let form_data = new FormData();
            form_data.append('isbn', isbn);
            form_data.append('mylove', mylove);
            let url = '/book/send';
            ax_fetch_post(url, form_data, function(res) {
                if(!res.success) common.notification(res.message);
                else {
                    common.notification('보냈습니다~');
                    get_list();
                    document.querySelector('#book_modal').style.display = 'none';
                    bookinfo = {};
                }
            });
        });
    }
    function del_book() {
        document.querySelector('.del_book').addEventListener('click', function(e) {
            if(!confirm('정말 빼시겠어요?')) return ;
            if(!bookinfo.isbn13) {
                common.notification('책이 없어요...');
                return false;
            }
            e.preventDefault();
            let isbn = bookinfo.isbn13;
            let form_data = new FormData();
            form_data.append('isbn', isbn);
            let url = '/book/del';
            ax_fetch_post(url, form_data, function(res) {
                if(!res.success) common.notification(res.message);
                else {
                    get_list();
                    document.querySelector('#book_modal').style.display = 'none';
                    bookinfo = {};
                }
            });
        });
    }
    function get_list() {
        let form_data = new FormData();
        let url = '/book/list';
        ax_fetch_post(url, form_data, function(res) {
            let bhtml = '';
            bookshelf = res.data;
            res.data.forEach(function(v, k) {
                bhtml += `<div class="book" data-bookshelf="${k}">
                    <div class="book_picture">
                        <img src="${v.thumbnail}" alt="">
                    </div>
                    <div class="book_info">
                        <div class="book_title">
                        ${v.title}
                        </div>
                        <div class="book_author">
                            <span>저자</span> ${v.authors}
                        </div>
                        <div class="book_publisher">
                            <span>출판</span> ${v.publisher}
                        </div>
                    </div>
                </div>`;
                /* bhtml += `<li>
                    <div class="book_image">
                        <img src="${v.thumbnail}" alt="">
                    </div>
                    <div class="book_subinfo">
                        <div class="list_title">${v.title}</div>
                        <div class="book_isbn">ISBN : <span>${v.isbn13}</span></div>
                        <div class="book_author">저자 : <span>${v.authors}</span></div>
                        <div class="book_translator">번역 : <span>${v.translators}</span></div>
                        <div class="book_publisher">출판사 : <span>${v.publisher}</span></div>
                        <div class="book_regdate">${v.regdate}</div>
                        <div class="book_link"><a href="${v.daum}" target="_blank">Daum 책 소개</a></div>
                        <button class="del_book" data-isbn13="${v.isbn13}">내 책장에서 뺄래요.</button>
                        <button class="send_book" data-isbn13="${v.isbn13}" data-mylove="2">지율이에게 보내기</button>
                        <button class="send_book" data-isbn13="${v.isbn13}" data-mylove="3">테스트에게 보내기</button>
                        <button class="send_book" data-isbn13="${v.isbn13}" data-mylove="4">테스트2에게 보내기</button>
                        <button class="send_book" data-isbn13="${v.isbn13}">내가 볼거에요.</button>
                    </div>
                </li>`; */
            });
            document.querySelector('.bookshelf').innerHTML = bhtml;
            book_modal();
        });
    }
    function add_book() {
        document.querySelectorAll('.add_book').forEach(function(item) {
            item.addEventListener('click', function(e) {
                let isbn = item.dataset.isbn13
                if(!isbn) {
                    common.notification('책이 없어요...');
                    return false;
                }
                e.preventDefault();
                let form_data = new FormData();
                form_data.append('isbn', isbn);
                let url = '/book/add';
                ax_fetch_post(url, form_data, function(res) {
                    if(!res.success) common.notification(res.message);
                    else {
                        common.notification('추가되었습니다.');
                        get_list();
                    }
                });
            });
        });
    }
    function go_mylove() {
        document.querySelectorAll('.kid').forEach(function(item) {
            item.addEventListener('click', function(e) {
                setTimeout(function() {
                    window.location.href = '/mylove?id=' + item.dataset.kid; 
                }, 200);
            });
        });
    }
    function get_mylove() {
        let form_data = new FormData();
        let url = '/user/mylove_list';
        ax_fetch_post(url, form_data, function(res) {
            let lhtml = '';
            let ohtml = '';
            res.data.forEach(function(v, k) {
                lhtml += `<div class="kid" data-kid="${v.user_idx}">
                    <div class="kid_picture">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="kid_name">${v.nickname}</div>
                </div>`;
                ohtml += `<option value="${v.user_idx}">${v.nickname}</option>`;
            });
            document.querySelector('.kids').insertAdjacentHTML('beforeend', lhtml);
            document.querySelector('#send_mylove').innerHTML = ohtml;
            go_mylove();
        });
    }
    function search_book() {
        document.querySelector('#search_book').addEventListener('click', function(e) {
            e.preventDefault();
            // form 데이터 처리
            let form_element = document.querySelector('#search_book_form');
            let form_data = new FormData(form_element);
            let url = form_element.action;
    
            ax_fetch_post(url, form_data, function(res) {
                let shtml = `<li class="book_info">검색 결과</li>`;
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
                            <div class="book_publisher">출판사 : <span>${v.publisher}</span></div>
                            <div class="book_regdate">${v.regdate}</div>
                            <div class="book_link"><a href="${v.daum}" target="_blank">Daum 책 소개</a></div>
                            <div class="book_button">
                                <button class="add_book" data-isbn13="${v.isbn13}">내 책장에 담기 +</button>
                            </div>
                        </div>
                    </li>`;
                });
                document.querySelector('.book_search_list').innerHTML = shtml;
                add_book();
            });
        });
    }
    function add_mylove() {
        document.querySelector('#add_mylove').addEventListener('click', function(e) {
            e.preventDefault();
            // form 데이터 처리
            let form_element = document.querySelector('#mylove_form');
            let form_data = new FormData(form_element);
            let url = form_element.action;
    
            ax_fetch_post(url, form_data, function(res) {
                if(res.success) {
                    common.notification('등록되었어요~');
                } else {
                    common.notification('오류가 있네요... ㅠㅠ');
                }
                get_mylove();
            });
        });
    }
    function login() {
        document.querySelector('#login_kakao').addEventListener('click', function() {
            setTimeout(function() {
                window.location.href = '/auth/kakao';
            }, 200);
        });
    }
    function userinfo() {
        document.querySelector('#logout').addEventListener('click', function() {
            setTimeout(function() {
                window.location.href = '/logout';
            }, 200);
        });
        document.querySelector('#userinfo').addEventListener('click', function() {
            setTimeout(function() {
                window.location.href = '/user/info';
            }, 200);
        });
    }
    function menu_modal() {        
        let nav = document.querySelector('#nav');
        let dim = document.querySelector('.dimmed');
        document.querySelector('.left_menu').addEventListener('click', function() {
            setTimeout(function() {
                nav.classList.add('active');
                dim.classList.add('on');
            }, 200);
        });
        document.querySelector('nav .close').addEventListener('click', function() {
            setTimeout(function() {
                nav.classList.remove('active');
                dim.classList.remove('on');
            });
        });
    }
    function book_modal() {
        function book_modal_show(book) {
            let book_modal = document.querySelector('#book_modal');
            bookinfo = bookshelf[book];
            let bhtml = `<div class="bookshelf_book_picture">
                <img src="${bookinfo.thumbnail}" alt="">
            </div>
            <div class="bookshelf_book_title">
                ${bookinfo.title}
            </div>
            <div class="bookshelf_book_publisher">
                <span>출판</span> ${bookinfo.publisher}
            </div>
            <div class="bookshelf_book_author">
                <span>저자</span> ${bookinfo.authors}
            </div>`;
            document.querySelector('#book_modal .bookshelf_book').innerHTML = bhtml;
            book_modal.style.display = 'block';
            document.querySelector('#book_modal .close').addEventListener('click', function() {
                book_modal.style.display = 'none';
                bookinfo = {};
            });
            window.onclick = function(event) {
                if(event.target == book_modal) {
                    book_modal.style.display = 'none';
                    bookinfo = {};
                }
            }
        }
        document.querySelectorAll('.book').forEach(function(item) {
            item.addEventListener('click', function() {
                setTimeout(function() {
                    book_modal_show(item.dataset.bookshelf);
                }, 200);
            });
        });
    }
    function kid_modal() {
        function kid_modal_show() {
            let kid_modal = document.querySelector('#kid_modal');
            kid_modal.style.display = 'block';
            document.querySelector('#kid_modal .close').addEventListener('click', function() {
                kid_modal.style.display = 'none';
            });
            window.onclick = function(event) {
                if(event.target == kid_modal) {
                    kid_modal.style.display = 'none';
                }
            }
        }
        document.querySelector('.kids .add').addEventListener('click', function() {
            setTimeout(function() {
                kid_modal_show();
            }, 200);
        });
    }
    init();
}
