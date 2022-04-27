(function () {
    // 思考要要做的事情
    // 获取用户表单输入
    // 发送到服务器进行登录

    // 获取 DOM 元素
    var userName = document.getElementById("userName");
    var userPassword = document.getElementById("userPassword");

    document.getElementById("formContainer").onsubmit = function (e) {
        e.preventDefault();
        // 判断非空
        var noEmpty = [userName.ariaValueMax, userPassword.value].every(function (item) {
            return item !== "";
        });
        if (noEmpty) {
            ajax({
                url: "/user/login",
                type: "POST",
                data: {
                    loginId: userName.value,
                    loginPwd: userPassword.value
                },
                success: function (res, xhr) {
                    res = JSON.parse(res);
                    if (!res.code) {
                        // 将获取到的 token 存储至 localStorage，然后跳转到聊天页面
                        localStorage.token = xhr.getResponseHeader("authorization");
                        window.location.replace('./index.html');
                    } else {
                        window.alert(res.msg);
                    }
                }
            })
        } else {
            // 进入此分支，说明有空项
            window.alert("请填写表单对应的项目");
        }
    }
})()