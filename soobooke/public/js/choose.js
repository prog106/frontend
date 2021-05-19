let Members = function() {
    let fetch = false;
    function get_member() {
        let url = '/user';
        common.ax_fetch_get(url, function(res) {
            let fhtml = '';
            if(res.success) {
                res.members.forEach(function(v, k) {
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
                        if(fetch) return false;
                        fetch = true;
                        item.classList.add('click');
                        let url = '/user/choose';
                        let form_data = new FormData();
                        form_data.append('user', item.dataset.user);
                        common.ax_fetch_put(url, form_data, function(res) {
                            fetch = false;
                            if(res.success) {
                                if(res.code == 'lock') {
                                    document.querySelector('input[name=user]').value = item.dataset.user;
                                    lock_modal_open();
                                } else {
                                    setTimeout(function() {
                                        common.home();
                                    }, 200);
                                }
                            } else {
                                common.notification(res.message);
                                if(res.code == 'logout') common.logout();
                                if(res.code == 'reload') common.reload();
                            }
                        });
                    });
                });
            } else {
                common.home();
            }
        });
    }
    function lock_password() {
        let lock_form = document.querySelector('form#lock_form');
        document.querySelector('.lockbtn').addEventListener('click', function() {
            if(fetch) return false;
            fetch = true;
            let lock_password = document.querySelector('input[name=lock_password]');
            if(lock_password.value.length < 4) {
                lock_password.focus();
                return false;
            }
            let url = lock_form.action;
            let form_data = new FormData(lock_form);
            common.ax_fetch_put(url, form_data, function(res) {
                fetch = false;
                if(res.success) {
                    setTimeout(function() {
                        common.home();
                    }, 200);
                } else {
                    common.notification(res.message);
                    if(res.code == 'logout') common.logout();
                }
            });
        });
    }
    function lock_modal_open() {
        document.querySelector('.layer_modal').style.display = 'flex';
        document.querySelector('.layer_modal .lock_wrap').style.display = 'block';
        document.querySelector('input[name=lock_password]').focus();
    }
    function lock_modal_close() {
        let layer_modal = document.querySelector('.layer_modal');
        layer_modal.querySelector('.lock_wrap .close').addEventListener('click', function() {
            layer_modal.style.display = 'none';
            layer_modal.querySelector('.lock_wrap').style.display = 'none';
            document.querySelector('input[name=lock_password]').value = '';
        });
        window.onclick = function(event) {
            if(event.target == layer_modal) {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.lock_wrap').style.display = 'none';
                document.querySelector('input[name=lock_password]').value = '';
            }
        }
    }
    return {
        init: function() {
            get_member();
            lock_modal_close();
            lock_password();
        }(),
    }
}();