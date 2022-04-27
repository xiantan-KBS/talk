(function() {
    // 思考要做的事情：
    // 1. 表单验证（包含非空以及用户名是否重复）
    // 2. 表单没有问题，提交表单，跳转到登录页面

    // 获取 DOM 元素
    var userName = document.getElementById("userName");
    var userNickname = document.getElementById("userNickname");
    var userPassword = document.getElementById("userPassword");
    var userConfirmPassword = document.getElementById("userConfirmPassword");
    var formContainer = document.getElementById("formContainer");
    var validateUserName = document.getElementById("validateUserName");
    var validateUserNickname = document.getElementById("validateUserNickname");
    var validateUserPassword = document.getElementById("validateUserPassword");
    var validateUserConfirmPassword = document.getElementById("validateUserConfirmPassword");

    // 用户名验证
    userName.onblur = function(e) {
        if (e.target.value) {
            ajax({
                url: "/user/exists",
                type: "GET",
                data: {
                    loginId: userName.value
                },
                success: function(res) {
                    res = JSON.parse(res);
                    if (!res.data) {
                        validateUserName.innerHTML = "";
                    } else {
                        validateUserName.innerHTML = "该用户已经注册";
                    }
                }
            })
        } else {
            validateUserName.innerHTML = "用户名不能为空";
        }
    }

    // 用户昵称验证
    userNickname.onblur = function(e) {
        if (e.target.value) {
            validateUserNickname.innerHTML = "";
        } else {
            validateUserNickname.innerHTML = "用户昵称不能为空";
        }
    }

    // 密码验证
    userPassword.onblur = function(e) {
        if (e.target.value) {
            validateUserPassword.innerHTML = "";
        } else {
            validateUserPassword.innerHTML = "密码不能为空";
        }
    }

    // 确认密码
    userConfirmPassword.onblur = function(e) {
        if (e.target.value) {
            if (e.target.value === userPassword.value) {
                validateUserConfirmPassword.innerHTML = "";
            } else {
                validateUserConfirmPassword.innerHTML = "两次密码不一致";
            }
        } else {
            validateUserConfirmPassword.innerHTML = "请再次输入密码";
        }
    }

    formContainer.onsubmit = function(e) {
        e.preventDefault(); // 阻止默认事件
        // 判断非空
        var noEmpty = [userName.value, userNickname.value, userPassword.value, userConfirmPassword.value].every(function(item) {
            return item !== "";
        })
        if (noEmpty) {
            // 进入此分支，说明没有空项
            // 获取所有的验证 span
            var validateItem = document.getElementsByClassName("validateItem");
            // 判断所有的 span 里面是否有内容
            var isPass = [...validateItem].every(function(item) {
                return item.innerHTML === "";
            });
            if (isPass) {
                // 进入此 if，说明验证通过，可以进行注册操作
                ajax({
                    url: "/user/reg",
                    type: "POST",
                    data: {
                        loginId: userName.value,
                        nickname: userNickname.value,
                        loginPwd: userPassword.value
                    },
                    success: function(res, xhr) {
                        res = JSON.parse(res);
                        if (!res.code) {
                            // 将返回的 token 存储至 localStorage
                            localStorage.token = xhr.getResponseHeader("authorization");
                            // 跳转至聊天页面
                            window.location.replace('./index.html');
                        } else {
                            window.alert(res.msg);
                        }
                    }
                })
            } else {
                window.alert("请按照要求填写每一项");
            }
        } else {
            // 进入此分支，说明有空项
            window.alert("请填写表单所有的项目");
        }
    }
})()