let Userinfo = function() {
    let fetch = false;
    function getpoint() {
        let url = '/user/point';
        common.ax_fetch_get(url, function(res) {
            if(res.success) {
                document.querySelector('.point').innerHTML = res.point + 'P';
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
            }
        });
    }
    function user_profile() {
        document.querySelector('.user_profile').addEventListener('click', function() {
            setTimeout(function() {
                document.querySelector('.layer_modal').style.display = 'flex';
                document.querySelector('.profile_wrap').style.display = 'block';
                document.querySelector('.profile_picture img').src = document.querySelector('.userinfo_title img').src;
            }, 200);
        });
        function readURL(input) {
            if (input.files && input.files[0]) {
                 var reader = new FileReader();
                reader.onload = function (e) {
                    document.querySelector('.user_profile_picture_preview').setAttribute('src', e.target.result);
                }
                reader.readAsDataURL(input.files[0]);
            }
        }
        document.querySelector("input[name=user_profile_picture]").addEventListener('change', function() {
            readURL(this);
        });
        document.querySelector('.profilebtn').addEventListener('click', function() {
            if(fetch) return false;
            fetch = true;
            let url = profile_form.action;
            let form_data = new FormData(profile_form);
            common.ax_fetch_put(url, form_data, function(res) {
                fetch = false;
                if(res.success) window.location.reload();
                else {
                    if(res.message) alert(res.message);
                    if(res.code == 'logout') common.logout();
                    if(res.code == 'choose') common.choose();
                }
            });
        });
    }
    function user_modal_close() {
        let layer_modal = document.querySelector('.layer_modal');
        layer_modal.querySelector('.profile_wrap .close').addEventListener('click', function() {
            setTimeout(function() {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.profile_wrap').style.display = 'none';
                document.querySelector('input[name=user_profile_picture]').value = '';
            }, 200);
        });
        layer_modal.querySelector('.lock_wrap .close').addEventListener('click', function() {
            setTimeout(function() {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.lock_wrap').style.display = 'none';
            }, 200);
        });
        layer_modal.querySelector('.unlock_wrap .close').addEventListener('click', function() {
            setTimeout(function() {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.unlock_wrap').style.display = 'none';
                document.querySelector('input[name=unlock_password]').value = '';
            }, 200);
        });
        window.onclick = function(event) {
            if(event.target == layer_modal) {
                setTimeout(function() {
                    layer_modal.style.display = 'none';
                    layer_modal.querySelector('.profile_wrap').style.display = 'none';
                    document.querySelector('input[name=user_profile_picture]').value = '';
                    document.querySelector('input[name=unlock_password]').value = '';
                    layer_modal.querySelector('.lock_wrap').style.display = 'none';
                    layer_modal.querySelector('.unlock_wrap').style.display = 'none';
                }, 200);
            }
        }
    }
    function user_lock() {
        let user_lock;
        if(user_lock = document.querySelector('.user_lock')) {
            user_lock.addEventListener('click', function() {
                document.querySelector('.layer_modal').style.display = 'flex';
                if(user_lock.dataset.lock == 'yes') {
                    document.querySelector('.unlock_wrap').style.display = 'block';
                    document.querySelector('.unlockbtn').addEventListener('click', function() {
                        if(fetch) return false;
                        fetch = true;
                        let unlock_password = document.querySelector('input[name=unlock_password]');
                        if(unlock_password.value.length < 4) {
                            unlock_password.focus();
                            return false;
                        }
                        let url = unlock_form.action;
                        let form_data = new FormData(unlock_form);
                        common.ax_fetch_put(url, form_data, function(res) {
                            fetch = false;
                            if(res.success) {
                                if(res.message) alert(res.message);
                                window.location.reload();
                            } else {
                                if(res.message) alert(res.message);
                                if(res.code == 'logout') common.logout();
                                if(res.code == 'reload') window.location.reload();
                                if(res.code == 'choose') common.choose();
                            }
                        });
                    });
                } else {
                    document.querySelector('.lock_wrap').style.display = 'block';
                    document.querySelector('.lockbtn').addEventListener('click', function() {
                        let lock_password = document.querySelector('input[name=lock_password]');
                        if(lock_password.value.length < 4) {
                            lock_password.focus();
                            return false;
                        }
                        let lock_password_re = document.querySelector('input[name=lock_password_re]');
                        if(lock_password_re.value.length < 4) {
                            lock_password_re.focus();
                            return false;
                        }
                        if(lock_password.value != lock_password_re.value) {
                            common.notification('비밀번호를 확인해 주세요.')
                            lock_password_re.focus();
                            return false;
                        }
                        let url = lock_form.action;
                        let form_data = new FormData(lock_form);
                        common.ax_fetch_put(url, form_data, function(res) {
                            fetch = false;
                            if(res.success) {
                                if(res.message) alert(res.message);
                                window.location.reload();
                            } else {
                                if(res.message) alert(res.message);
                                if(res.code == 'logout') common.logout();
                                if(res.code == 'reload') window.location.reload();
                                if(res.code == 'choose') common.choose();
                            }
                        });
                    });
                }
            });
        }
    }
    function user_change_member() {
        document.querySelector('.user_change_member').addEventListener('click', function() {
            if(fetch) return false;
            fetch = true;
            let url = '/user/reset';
            let form_data = new FormData();
            common.ax_fetch_put(url, form_data, function(res) {
                fetch = false;
                if(res.success) common.choose();
                else {
                    if(res.message) alert(res.message);
                    if(res.code == 'logout') common.logout();
                    if(res.code == 'choose') common.choose();
                }
            });
        });
    }
    return {
        init: function() {
            getpoint();
            user_profile();
            user_lock();
            user_change_member();
            user_modal_close();
        }(),
    }
}();
