let Userinfo = function() {
    function user_profile() {
        document.querySelector('.user_profile').addEventListener('click', function() {
            document.querySelector('.layer_modal').style.display = 'flex';
            document.querySelector('.profile_wrap').style.display = 'block';
            document.querySelector('.profile_picture img').src = document.querySelector('.userinfo_title img').src;
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
        let profile_form = document.querySelector('form#profile_form');
        document.querySelector('.profilebtn').addEventListener('click', function() {
            let url = profile_form.action;
            let form_data = new FormData(profile_form);
            common.ax_fetch_post(url, form_data, function(res) {
                if(res.success) window.location.reload();
                else {
                    alert(res.message);
                    if(res.code == 'logout') common.logout();
                }
            });
        });
    }
    function user_modal_close() {
        let layer_modal = document.querySelector('.layer_modal');
        layer_modal.querySelector('.profile_wrap .close').addEventListener('click', function() {
            layer_modal.style.display = 'none';
            layer_modal.querySelector('.profile_wrap').style.display = 'none';
            document.querySelector('input[name=user_profile_picture]').value = '';
        });
        layer_modal.querySelector('.lock_wrap .close').addEventListener('click', function() {
            layer_modal.style.display = 'none';
            layer_modal.querySelector('.lock_wrap').style.display = 'none';
        });
        layer_modal.querySelector('.unlock_wrap .close').addEventListener('click', function() {
            layer_modal.style.display = 'none';
            layer_modal.querySelector('.unlock_wrap').style.display = 'none';
        });
        window.onclick = function(event) {
            if(event.target == layer_modal) {
                layer_modal.style.display = 'none';
                layer_modal.querySelector('.profile_wrap').style.display = 'none';
                document.querySelector('input[name=user_profile_picture]').value = '';
                layer_modal.querySelector('.lock_wrap').style.display = 'none';
                layer_modal.querySelector('.unlock_wrap').style.display = 'none';
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
                        let unlock_password = document.querySelector('input[name=unlock_password]');
                        if(unlock_password.value.length < 4) {
                            unlock_password.focus();
                            return false;
                        }
                        let url = unlock_form.action;
                        let form_data = new FormData(unlock_form);
                        common.ax_fetch_post(url, form_data, function(res) {
                            if(res.success) {
                                if(res.message) alert(res.message);
                                window.location.reload();
                            } else {
                                alert(res.message);
                                if(res.code == 'logout') common.logout();
                                if(res.code == 'reload') window.location.reload();
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
                            alert('비밀번호를 확인해 주세요.')
                            lock_password_re.focus();
                            return false;
                        }
                        let url = lock_form.action;
                        let form_data = new FormData(lock_form);
                        common.ax_fetch_post(url, form_data, function(res) {
                            if(res.success) {
                                if(res.message) alert(res.message);
                                window.location.reload();
                            } else {
                                alert(res.message);
                                if(res.code == 'logout') common.logout();
                                if(res.code == 'reload') window.location.reload();
                            }
                        });
                    });
                }
            });
        }
    }
    function user_change_member() {
        document.querySelector('.user_change_member').addEventListener('click', function() {
            let url = '/user/reset_profile';
            let form_data = new FormData();
            common.ax_fetch_post(url, form_data, function(res) {
                if(res.success) common.member();
                else {
                    alert(res.message);
                    if(res.code == 'logout') common.logout();
                }
            });
        });
    }
    return {
        init: function() {
            if(!common.uid()) {
                common.logout();
                return false;
            }
            user_profile();
            user_lock();
            user_change_member();
            user_modal_close();
        }(),
    }
}();





function Userinfos(user) {
    init();
    function init() {
        open_profile();
        profile_modal();
        modify_profile_thumb();
        modify_profile();
        delete_profile();
        menu();
        logout();
    }
    function open_profile() {
        let profile_wrap = document.querySelector('.profile_wrap');
        document.querySelector('.user_profile').addEventListener('click', function() {
            profile_wrap.style.display = 'flex';
            profile_wrap.querySelector('img').src = document.querySelector('.user_info img').src;
            profile_wrap.querySelector('input[name=user_nick]').value = document.querySelector('.user_info .name').textContent;
        });
    }
    // function _get_member() {
    //     let url = '/user/get_member';
    //     let form_data = new FormData();
    //     common.ax_fetch_post(url, form_data, function(res) {
    //         let fhtml = '';
    //         if(res.success) {
    //             res.members.forEach(function(v, k) {
    //                 fhtml += `<div class="member${(v.user_idx == <%=user.user_idx%>)?' me':''}" data-user_idx="${v.user_idx}">
    //                     <img src="${v.user_profile}" alt="">
    //                     <span class="name">${v.user_name}</span>
    //                 </div>`;
    //             });
    //             if(res.members.length < 4) {
    //                 fhtml += `<div class="member_add" id="add_member">
    //                     <i class="fas fa-plus"></i>
    //                 </div>`;
    //             }
    //             document.querySelector('.member_form').innerHTML = fhtml;
    //             let member_wrap = document.querySelector('.member_wrap');
    //             document.querySelectorAll('.member').forEach(function(item) {
    //                 item.addEventListener('click', function() {
    //                     member_wrap.style.display = 'flex';
    //                     member_wrap.querySelector('input[name=user_idx]').value = item.dataset.user_idx;
    //                     member_wrap.querySelector('img').src = item.querySelector('img').src;
    //                     member_wrap.querySelector('input[name=user_nick]').value = item.querySelector('.name').textContent;
    //                 });
    //             });
    //             document.querySelector('.member_add').addEventListener('click', function() {
    //                 let url = '/user/add_profile';
    //                 let form_data = new FormData();
    //                 common.ax_fetch_post(url, form_data, function(res) {
    //                     if(res.success) {
    //                         get_member();
    //                     } else {
    //                         alert(res.message);
    //                     }
    //                 });
    //             });
    //         } else {
    //             alert(res.message);
    //         }
    //     });
    // }
    function profile_modal() {
        let profile_wrap = document.querySelector('.profile_wrap');
        function close() {
            profile_wrap.style.display = 'none';
            profile_wrap.querySelector('img').src = '';
            profile_wrap.querySelector('input[name=user_nick]').value = '';
        }
        document.querySelector('.close').addEventListener('click', function() {
            close();
        });
        window.onclick = function(event) {
            if(event.target == profile_wrap) {
                close();
            }
        }
    }
    function modify_profile_thumb() {
        let user_profile = document.querySelector('input[name=user_profile]')
        user_profile.addEventListener('change', function() {
            let member_form = document.querySelector('form#profile_form');
            let form_data = new FormData(member_form);
            let url = '/user/modify_profile_thumb';
            common.ax_fetch_post(url, form_data, function(res) {
                if(res.success) {
                    // document.querySelector('.profile_wrap img').src = res.profile;
                    document.querySelector('.user_info img').src = res.profile;
                    document.querySelector('.profile_wrap .close').click();
                    // alert('수정되었습니다.');
                } else {
                    alert(res.message);
                }
                user_profile.value = '';
            });
        });
    }
    function modify_profile() {
        document.querySelector('form#profile_form .profilebtn').addEventListener('click', function() {
            let member_form = document.querySelector('form#profile_form');
            let form_data = new FormData(member_form);
            let url = member_form.action;
            common.ax_fetch_post(url, form_data, function(res) {
                if(res.success) {
                    document.querySelector('.user_info .name').textContent = member_form.querySelector('input[name=user_nick]').value;
                    document.querySelector('.profile_wrap .close').click();
                    // alert('수정되었습니다.');
                    // get_member();
                } else {
                    alert(res.message);
                }
            });
        });
    }
    function delete_profile() {
        document.querySelector('form#profile_form .delete_profilebtn').addEventListener('click', function() {
            if(!confirm('계정을 정말 삭제하시겠습니까?')) return false;
            let form_data = new FormData();
            let url = '/user/delete_profile';
            common.ax_fetch_post(url, form_data, function(res) {
                if(res.success) {
                    get_member();
                    document.querySelector('.close').click();
                } else {
                    alert(res.message);
                }
            });
        });
    }
    function menu() {
        // document.querySelector('.menu_login_code').addEventListener('click', function() {
        //     setTimeout(function() {
        //         alert('준비중');
        //         // window.location.href = '/user/login_code';
        //     }, 200);
        // });
        document.querySelector('.menu_member').addEventListener('click', function() {
            setTimeout(function() {
                window.location.href = '/member';
            }, 200);
        });
    }
    function logout() {
        document.querySelector('.logout').addEventListener('click', function() {
            setTimeout(function() {
                window.location.href = '/logout';
            }, 200);
        });
    }
}
