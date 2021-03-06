let Usermember = function() {
    let fetch = false;
    function get_member() {
        let url = '/user';
        common.ax_fetch_get(url, function(res) {
            let fhtml = '';
            if(res.success) {
                res.members.forEach(function(v, k) {
                    if(v.user_parent) return true;
                    fhtml += `<div class="member">
                        <div class="member_info" data-user="${v.user}">
                            <img src="${v.user_profile}" alt="">
                            <span class="name">${v.user_name}</span>
                            <span class="icon"><i class="fas fa-chevron-right"></i></span>
                        </div>
                    </div>`;
                });
                document.querySelector('.member_list').innerHTML = fhtml;
                document.querySelectorAll('.member_info').forEach(function(item) {
                    item.addEventListener('click', function() {
                        setTimeout(function() {
                            document.querySelector('.layer_modal').style.display = 'flex';
                            let mod_wrap = document.querySelector('.member_mod_wrap');
                            mod_wrap.style.display = 'block';
                            mod_wrap.querySelector('input[name=user]').value = item.dataset.user;
                            mod_wrap.querySelector('.member_mod_picture_preview').src = item.querySelector('img').src;
                            mod_wrap.querySelector('input[name=user_name]').value = item.querySelector('.name').textContent;
                        }, 200);
                    });
                });
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
            }
        });
    }
    function member_add_modal() {
        document.querySelector('.member_add').addEventListener('click', function() {
            setTimeout(function() {
                document.querySelector('.layer_modal').style.display = 'flex';
                document.querySelector('.member_add_wrap').style.display = 'block';
            }, 200);
        });
        function readURL(input) {
            if (input.files && input.files[0]) {
                 var reader = new FileReader();
                reader.onload = function (e) {
                    document.querySelector('.member_add_picture_preview').setAttribute('src', e.target.result);
                }
                reader.readAsDataURL(input.files[0]);
            }
        }
        document.querySelector("input[name=user_picture]").addEventListener('change', function() {
            readURL(this);
        });
        document.querySelector('.member_add_btn').addEventListener('click', function() {
            if(fetch) return false;
            fetch = true;
            let url = member_add_form.action;
            let form_data = new FormData(member_add_form);
            common.ax_fetch_post(url, form_data, function(res) {
                fetch = false;
                if(res.success) {
                    document.querySelector('.member_add_wrap .close').click();
                    get_member();
                } else {
                    if(res.message) alert(res.message);
                    if(res.code == 'logout') common.logout();
                    if(res.code == 'reload') common.reload();
                    if(res.code == 'choose') common.choose();
                }
            });
        });
    }
    function member_mod_modal() {
        function readURL(input) {
            if (input.files && input.files[0]) {
                 var reader = new FileReader();
                reader.onload = function (e) {
                    document.querySelector('.member_mod_picture_preview').setAttribute('src', e.target.result);
                }
                reader.readAsDataURL(input.files[0]);
            }
        }
        document.querySelector("input[name=user_mod_picture]").addEventListener('change', function() {
            readURL(this);
        });
        document.querySelector('.member_mod_btn').addEventListener('click', function() {
            if(fetch) return false;
            fetch = true;
            let url = member_mod_form.action;
            let form_data = new FormData(member_mod_form);
            common.ax_fetch_put(url, form_data, function(res) {
                fetch = false;
                if(res.success) {
                    get_member();
                    setTimeout(function() {
                        document.querySelector('.member_mod_wrap .close').click();
                    }, 200);
                } else {
                    if(res.message) alert(res.message);
                    if(res.code == 'reload') common.reload();
                    if(res.code == 'logout') common.logout();
                    if(res.code == 'choose') common.choose();
                }
            });
        });
        document.querySelector('.member_del_btn').addEventListener('click', function() {
            if(!confirm('주의!\n삭제 후 사용자 및 데이터의 복구가 불가능합니다.\n사용자를 삭제하시겠습니까?')) return false;
            if(fetch) return false;
            fetch = true;
            let url = member_mod_form.action;
            let form_data = new FormData(member_mod_form);
            common.ax_fetch_delete(url, form_data, function(res) {
                fetch = false;
                if(res.success) {
                    common.notification('사용자가 삭제되었습니다.');
                    document.querySelector('.member_mod_wrap .close').click();
                    get_member();
                } else {
                    if(res.message) alert(res.message);
                    if(res.code == 'reload') common.reload();
                    if(res.code == 'logout') common.logout();
                    if(res.code == 'choose') common.choose();
                }
            });
        });
    }
    function member_modal_close() {
        let layer_modal = document.querySelector('.layer_modal');
        layer_modal.querySelector('.member_add_wrap .close').addEventListener('click', function() {
            setTimeout(function() {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.member_add_wrap').style.display = 'none';
            }, 200);
        });
        layer_modal.querySelector('.member_mod_wrap .close').addEventListener('click', function() {
            setTimeout(function() {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.member_mod_wrap').style.display = 'none';
            }, 200);
        });
        window.onclick = function(event) {
            if(event.target == layer_modal) {
                setTimeout(function() {
                    layer_modal.style.display = 'none';
                    layer_modal.querySelector('.member_add_wrap').style.display = 'none';
                    layer_modal.querySelector('.member_mod_wrap').style.display = 'none';
                }, 200);
            }
        }
    }
    return {
        init: function() {
            get_member();
            member_add_modal();
            member_mod_modal();
            member_modal_close();
        }(),
    }
}();
