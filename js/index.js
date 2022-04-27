(function () {
    var page = 0; // 当前页码数
    var size = 10; // 每一页显示多少条聊天记录
    var chatTotal = 0; // 聊天记录总数
    var sendType = "enter"; // 默认的发送消息类型（按 Enter 发送消息）

    // 思考要做的事情，然后一件一件完成
    // 1. 点击关闭按钮能够退出
    document.getElementById("closeBtn").onclick = function () {
        localStorage.removeItem('token'); // 清除 token
        window.location.replace("./login.html");
    }

    // 2. 获取用户的信息，渲染到右侧对应区域
    ajax({
        url: "/user/profile",
        success: function (res) {
            res = JSON.parse(res);
            if (!res.code) {
                // 进入此 if，说明网络请求正常，进行对应的处理
                document.getElementById("nickName").innerHTML = res.data.nickname;
                document.getElementById("accountName").innerHTML = res.data.loginId;
                document.getElementById("loginTime").innerHTML = formDate(res.data.lastLoginTime);
            } else {
                window.alert(res.msg);
                document.getElementById("closeBtn").click();
            }
        }
    })

    // 3. 获取该账户的聊天记录，并调用 renderChatForm 函数对聊天记录进行渲染
    // 因为该功能会多次用到，所以选择封装成一个函数
    /**
     * 获取该账户的聊天记录函数
     * @param {*} direction 方向
     */
    function initChatList(direction) {
        ajax({
            url: "/chat/history",
            data: {
                page,
                size
            },
            success: function (res) {
                res = JSON.parse(res);
                if (!res.code) {
                    chatTotal = res.chatTotal; // 存储总聊天数量
                    // 调用渲染聊天界面的函数
                    renderChatForm(res.data, direction);
                } else {
                    window.alert(res.msg);
                    document.getElementById("closeBtn").click();
                }
            }
        })
    }
    initChatList("bottom");


    /**
     * 渲染聊天界面的函数
     * @param {*} list 聊天记录列表
     * @param {*} direction 默认显示顶部还是底部
     */
    function renderChatForm(list, direction) {
        var contentBody = document.getElementById("contentBody");
        /* 没有历史记录的时候，不需要进行一个渲染 */
        if (!list.length) {
            contentBody.innerHTML = `
                <div class="chat-container robot-container">
                    <img src="../img/robot.jpg" alt="">
                    <div class="chat-txt">
                    您好! 我是腾讯机器人，非常欢迎您的到来，有什么想和我聊聊的吗？
                    </div>
                </div>
            `;
            return;
        }
        // 没有进入上面的 if，说明存在聊天记录，开始进行聊天记录的渲染
        // 反转聊天记录的顺序
        list.reverse();
        // 生成聊天记录对应的 HTML 结构
        var chatData = list.map(function (item) {
            return item.from === 'user' ?
                `<div class="chat-container avatar-container">
                            <img src="../img/avtar.png" alt="">
                            <div class="chat-txt">${item.content}</div>
            </div>`
                : ` <div class="chat-container robot-container">
                        <img src="../img/robot.jpg" alt="">
                        <div class="chat-txt">
                        ${item.content}
                        </div>
                </div>`;
        });
        // 根据 direction 的值来决定是否显示到最下面
        if (direction === "bottom") {
            // 进入此 if，说明我们要做一个处理，那就是渲染聊天记录后默认滚动到最下面
            contentBody.innerHTML += chatData.join(' ');
            // 获取最后一个聊天信息的 offsetTop 值
            var bottomDistance = document.querySelectorAll('.chat-container')[document.querySelectorAll('.chat-container').length - 1].offsetTop
            contentBody.scrollTo(0, bottomDistance);
        } else {
            // 进入此分支，说明聊天记录默认显示最上面部分即可
            // 新的聊天记录要拼接在原本聊天记录的前面
            contentBody.innerHTML = chatData.join(' ') + contentBody.innerHTML;
        }
    }

    // 4. 发送聊天信息
    document.getElementById("sendBtn").onclick = function () {
        // 获取用户输入的信息
        var content = document.getElementById("inputContainer").value.trim();
        if (!content) {
            window.alert("发送信息不能为空");
            return;
        }
        // 调用渲染函数将自己的内容渲染到界面上
        renderChatForm([{
            from: "user",
            content
        }], "bottom");
        // 清空输入框
        document.getElementById("inputContainer").value = "";
        // 发送数据到后端
        ajax({
            url: "/chat",
            type: "POST",
            data: {
                content
            },
            success: function (res) {
                res = JSON.parse(res);
                if (!res.code) {
                    // 获取到后端的数据后，同样调用 renderChatForm 进行一个渲染
                    renderChatForm([{
                        from: "robot",
                        content: res.data.content
                    }], "bottom")
                } else {
                    window.alert(res.msg);
                    document.getElementById("closeBtn").click();
                }
            }
        })
    }

    // 5. 滚动效果
    document.getElementById("contentBody").onscroll = function () {
        // 滚动到顶部的时候进行加载第二页的数据
        if (this.scrollTop === 0) {
            // 判断后端是否还有数据
            if (chatTotal <= (page + 1) * size) return;
            page++
            // 这一次获取聊天记录，渲染的模式就是 top，表示不用滚动到最下方
            initChatList("top");
        }
    }

    // 6. 不同的发送信息的方式
    // 显示下拉发送选项
    document.getElementById("arrowBtn").onclick = function () {
        document.getElementById("selectType").style.display = "block";
    }
    // 修改发送选项，要做的事情就是为用户选择的下拉选项添加 on
    // 然后重新给 sendType 赋值
    document.getElementById("selectType").onclick = function (e) {
        if (e.target.classList.contains("select-item")) {
            // 统一去除 on 属性
            var selectItems = document.getElementsByClassName("select-item");
            for (var i = 0; i < selectItems.length; i++) {
                selectItems[i].classList.remove('on');
            }
            // 当前点击的元素添加 on 属性，以此有一个背景颜色
            e.target.classList.add("on");
            // 修改 sendType 发送消息模式
            sendType = e.target.getAttribute('type')
            // 隐藏下拉发送选项
            selectType.style.display = 'none'
        }
    }
    // 通过 keyup 事件来监听用户的按键行为
    document.getElementById("inputContainer").onkeyup = function (e) {
        if (e.key === "Enter" && sendType === "enter" && !e.ctrlKey || e.key === "Enter" && sendType === "ctrlEnter" && e.ctrlKey) {
            document.getElementById("sendBtn").click();
        }
    }
})()