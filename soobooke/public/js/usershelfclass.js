let Usershelfclass = function() {
    let fetch = false;
    function get_shelfclass() {
        let url = '/user/shelfclass/info';
        common.ax_fetch_get(url, function(res) {
            let fhtml = '';
            if(res.success) {
                res.shelfclass.forEach(function(v, k) {
                    fhtml += `<div class="shelfclass">
                        <div class="shelfclass_info" data-shelf="${v.shelf}">
                            <span class="name">${v.shelf_name}</span>
                            <span class="icon"><i class="fas fa-chevron-right"></i></span>
                        </div>
                    </div>`;
                });
                document.querySelector('.shelfclass_list').innerHTML = fhtml;
                document.querySelectorAll('.shelfclass_info').forEach(function(item) {
                    item.addEventListener('click', function() {
                        setTimeout(function() {
                            document.querySelector('.layer_modal').style.display = 'flex';
                            let mod_wrap = document.querySelector('.shelfclass_mod_wrap');
                            mod_wrap.style.display = 'block';
                            mod_wrap.querySelector('input[name=shelf]').value = item.dataset.shelf;
                            mod_wrap.querySelector('input[name=shelfclass_name]').value = item.querySelector('.name').textContent;
                        }, 200);
                    });
                });
            } else {
                common.home();
            }
        });
    }
    function shelfclass_add_modal() {
        document.querySelector('.shelfclass_add').addEventListener('click', function() {
            setTimeout(function() {
                document.querySelector('.layer_modal').style.display = 'flex';
                document.querySelector('.shelfclass_add_wrap').style.display = 'block';
            }, 200);
        });
        document.querySelector('.shelfclass_add_btn').addEventListener('click', function() {
            if(fetch) return false;
            fetch = true;
            let url = shelfclass_add_form.action;
            let form_data = new FormData(shelfclass_add_form);
            common.ax_fetch_post(url, form_data, function(res) {
                fetch = false;
                if(res.success) {
                    common.notification('책꽂이가 추가되었습니다.');
                    document.querySelector('.shelfclass_add_wrap .close').click();
                    get_shelfclass();
                } else {
                    common.notification(res.message);
                    if(res.code == 'logout') common.logout();
                    if(res.code == 'reload') common.reload();
                }
            });
        });
    }
    function shelfclass_mod_modal() {
        document.querySelector('.shelfclass_mod_btn').addEventListener('click', function() {
            if(fetch) return false;
            fetch = true;
            let url = shelfclass_mod_form.action;
            let form_data = new FormData(shelfclass_mod_form);
            common.ax_fetch_put(url, form_data, function(res) {
                fetch = false;
                if(res.success) {
                    common.notification('책꽂이가 수정되었습니다.');
                    document.querySelector('.shelfclass_mod_wrap .close').click();
                    get_shelfclass();
                } else {
                    alert(res.message);
                    if(res.code == 'reload') common.reload();
                    if(res.code == 'logout') common.logout();
                }
            });
        });
        document.querySelector('.shelfclass_del_btn').addEventListener('click', function() {
            if(!confirm('책꽂이를 삭제하시겠습니까?\n\n삭제 후 책꽂이의 책은 기타로 이동됩니다.')) return false;
            if(fetch) return false;
            fetch = true;
            let url = shelfclass_mod_form.action;
            let form_data = new FormData(shelfclass_mod_form);
            common.ax_fetch_delete(url, form_data, function(res) {
                fetch = false;
                if(res.success) {
                    common.notification('책꽂이가 삭제되었습니다.');
                    document.querySelector('.shelfclass_mod_wrap .close').click();
                    get_shelfclass();
                } else {
                    alert(res.message);
                    if(res.code == 'reload') common.reload();
                    if(res.code == 'logout') common.logout();
                }
            });
        });
    }
    function shelfclass_modal_close() {
        let layer_modal = document.querySelector('.layer_modal');
        layer_modal.querySelector('.shelfclass_add_wrap .close').addEventListener('click', function() {
            setTimeout(function() {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.shelfclass_add_wrap').style.display = 'none';
            }, 200);
        });
        layer_modal.querySelector('.shelfclass_mod_wrap .close').addEventListener('click', function() {
            setTimeout(function() {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.shelfclass_mod_wrap').style.display = 'none';
            }, 200);
        });
        window.onclick = function(event) {
            if(event.target == layer_modal) {
                setTimeout(function() {
                    layer_modal.style.display = 'none';
                    layer_modal.querySelector('.shelfclass_add_wrap').style.display = 'none';
                    layer_modal.querySelector('.shelfclass_mod_wrap').style.display = 'none';
                }, 200);
            }
        }
    }
    return {
        init: function() {
            get_shelfclass();
            shelfclass_add_modal();
            shelfclass_mod_modal();
            shelfclass_modal_close();
        }(),
    }
}();