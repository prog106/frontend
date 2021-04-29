let Members = function(user) {
    function get_member(user) {
        let url = '/user/get_member';
        let form_data = new FormData();
        common.ax_fetch_post(url, form_data, function(res) {
            let fhtml = '';
            if(res.success) {
                res.members.forEach(function(v, k) {
                    fhtml += `<div class="member" data-user_idx="${v.user_idx}">
                        <img src="${v.user_profile}" alt="">
                        <span class="name">${v.user_name}</span>
                    </div>`;
                });
                document.querySelector('.member_list').innerHTML = fhtml;
                document.querySelectorAll('.member').forEach(function(item) {
                    item.addEventListener('click', function() {
                        let url = '/user/profile';
                        let form_data = new FormData();
                        form_data.append('user_idx', item.dataset.user_idx);
                        common.ax_fetch_post(url, form_data, function(res) {
                            if(res.success) {
                                if(res.code == 'lock') lock_modal_open();
                                else common.home();
                            } else {
                                alert(res.message);
                                if(res.code == 'logout') common.logout();
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
            let lock_password = document.querySelector('input[name=lock_password]');
            if(lock_password.value.length < 4) {
                lock_password.focus();
                return false;
            }
            let url = lock_form.action;
            let form_data = new FormData(lock_form);
            common.ax_fetch_post(url, form_data, function(res) {
                if(res.success) {
                    common.home();
                } else {
                    alert(res.message);
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
            get_member(user);
            lock_modal_close();
            lock_password();
            // add_profile();
            // modal_close();
        }(),
        /* openadd: function() {
            let layer_modal = document.querySelector('.layer_modal');
            let member_add_wrap = document.querySelector('.member_add_wrap');
            setTimeout(function() {
                document.querySelector('.member_profile img').src = '/profile/unjct9uk30.png';
                layer_modal.style.display = 'block';
                member_add_wrap.style.display = 'flex';
            }, 200);
            document.querySelector('.member_add_form .close').addEventListener('click', function() {
                member_add_wrap.style.display = 'none';
                layer_modal.style.display = 'none';
            });
            window.onclick = function(event) {
                if(event.target == member_add_wrap) {
                    member_add_wrap.style.display = 'none';
                    layer_modal.style.display = 'none';
                }
            }
        },
        add_profile: function() {
            let member_add_form = document.querySelector('form#member_add_form');
            document.querySelector('.addprofilebtn').addEventListener('click', function() {
                let member_name = document.querySelector('input[name=member_name]');
                if(member_name.value.length < 1) {
                    member_name.focus();
                    return false;
                }
                let url = member_add_form.action;
                let form_data = new FormData(member_add_form);
                common.ax_fetch_post(url, form_data, function(res) {
                    if(res.success) {
                        get_member();
                        document.querySelector('.member_add_form .close').click();
                        member_name.value = '';
                    } else {
                        alert(res.message);
                        if(res.code == 'logout') common.logout();
                    }
                });
            });
        } */
    }
};
new Members(true);

/* function Member(user) {
    function init() {
        get_member(user);
        if(user) add_profile();
    }
    function get_member(user) {
        let url = '/user/get_member';
        let form_data = new FormData();
        common.ax_fetch_post(url, form_data, function(res) {
            let fhtml = '';
            if(res.success) {
                res.members.forEach(function(v, k) {
                    fhtml += `<div class="member${(v.user_idx == <%=(user.user_idx)?user.user_idx:0%>)?' me':''}" data-user_idx="${v.user_idx}">
                        <img src="${v.user_profile}" alt="">
                        <span class="name">${v.user_name}</span>
                    </div>`;
                });
                if(user && res.members.length < 4) {
                    fhtml += `<div class="member_add">+</div>`;
                }
                document.querySelector('.member_list').innerHTML = fhtml;
                document.querySelectorAll('.member').forEach(function(item) {
                    item.addEventListener('click', function() {
                        let url = '/user/profile';
                        let form_data = new FormData();
                        form_data.append('user_idx', item.dataset.user_idx);
                        common.ax_fetch_post(url, form_data, function(res) {
                            if(res.success) {
                                window.location.href = '/';
                            } else {
                                alert(res.message);
                            }
                        });
                    });
                });
                if(user && res.members.length < 4) {
                    let member_add_wrap = document.querySelector('.member_add_wrap');
                    document.querySelector('.member_add').addEventListener('click', function() {
                        document.querySelector('.member_profile img').src = '/profile/unjct9uk30.png';
                        member_add_wrap.style.display = 'flex';
                    });
                }
            } else {
                window.location.href = '/';
            }
        });
    }
    function add_profile() {
        let member_add_form = document.querySelector('form#member_add_form');
        document.querySelector('.addprofilebtn').addEventListener('click', function() {
            let member_name = document.querySelector('input[name=member_name]');
            if(member_name.value.length < 1) {
                member_name.focus();
                return false;
            }
            let url = member_add_form.action;
            let form_data = new FormData(member_add_form);
            common.ax_fetch_post(url, form_data, function(res) {
                if(res.success) {
                    get_member();
                    document.querySelector('.close').click();
                    member_name.value = '';
                } else {
                    alert(res.message);
                }
            });
        });
        let member_add_wrap = document.querySelector('.member_add_wrap');
        document.querySelector('.close').addEventListener('click', function() {
            member_add_wrap.style.display = 'none';
        });
        window.onclick = function(event) {
            if(event.target == member_add_wrap) {
                member_add_wrap.style.display = 'none';
            }
        }
    }
}
 */