let Usermember = function() {
    function get_member() {
        let url = '/user/get_member';
        let form_data = new FormData();
        form_data.append('uid', common.uid());
        common.ax_fetch_post(url, form_data, function(res) {
            let fhtml = '';
            if(res.success) {
                res.members.forEach(function(v, k) {
                    if(v.user_parent) return true;
                    fhtml += `<div class="member">
                        <div class="member_info" data-user_idx="${v.user_idx}">
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
                            mod_wrap.querySelector('input[name=user_idx]').value = item.dataset.user_idx;
                            mod_wrap.querySelector('.member_mod_picture_preview').src = item.querySelector('img').src;
                            mod_wrap.querySelector('input[name=user_name]').value = item.querySelector('.name').textContent;
                        }, 200);
                    });
                });
            } else {
                common.home();
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
        let member_add_form = document.querySelector('form#member_add_form');
        document.querySelector('.member_add_btn').addEventListener('click', function() {
            let url = member_add_form.action;
            let form_data = new FormData(member_add_form);
            form_data.append('uid', common.uid());
            common.ax_fetch_post(url, form_data, function(res) {
                if(res.success) {
                    document.querySelector('.member_add_wrap .close').click();
                    get_member();
                } else {
                    alert(res.message);
                    if(res.code == 'logout') common.logout();
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
        let member_mod_form = document.querySelector('form#member_mod_form');
        document.querySelector('.member_mod_btn').addEventListener('click', function() {
            let url = member_mod_form.action;
            let form_data = new FormData(member_mod_form);
            form_data.append('uid', common.uid());
            common.ax_fetch_post(url, form_data, function(res) {
                if(res.success) {
                    get_member();
                    setTimeout(function() {
                        document.querySelector('.member_mod_wrap .close').click();
                    }, 200);
                } else {
                    alert(res.message);
                    if(res.code == 'reload') common.reload();
                    if(res.code == 'logout') common.logout();
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
            if(!common.uid()) common.logout();
            else {
                get_member();
                member_add_modal();
                member_mod_modal();
                member_modal_close();
                // lock_modal_close();
                // lock_password();
            }
        }(),
    }
}();