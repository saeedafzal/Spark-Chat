//global variables
var userName;
var recipientName;
var ws;
var chats = {};

//hide divs
id('contacts').style.display = 'none';
id('chatScreen').style.display = 'none';
id('notif').style.display = 'none';
id('createAcc').style.display = 'none';
id('loginField').value = localStorage.getItem("username");
id('passField').value = localStorage.getItem("password");

//http requests
function login() {
    document.body.style.background = "#C5DDEB";
    if (id('loginField').value === '' || id('passField').value === '') {
        alert("Enter both fields!");
        return;
    }

    if (id('checkBox').checked) {
        localStorage.setItem("username", id('loginField').value);
        localStorage.setItem("password", id('passField').value);
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4567/login");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);
            if (json.status === true) {
                id('login').style.display = 'none';
                id('contacts').style.display = 'block';
                document.title = 'Contacts';
                startSocket();
                // userList();
                alert("LOGGED IN!");
            } else {
                alert(json.message);
            }
        }
    };
    userName = document.getElementById('loginField').value;
    var username = JSON.stringify({
        username: id('loginField').value,
        password: id('passField').value
    });
    xhr.send(username);
}

function logout() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4567/logout");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);
            if (json.status === true) {
                ws.close();
                document.write(json.message);
            } else {
                alert(json.message);
            }
        }
    };
    xhr.send(userName);
}

function createAcc() {
    if (id('loginF').value === '' || id('passF').value === '') {
        alert("Fields need to be entered");
        return;
    }

    if (id('confPassF').value !== id('passF').value) {
        alert("Passwords do not match!");
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4567/createAccount");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);
            alert(json.message);
            if (json.status) {
                id('createAcc').style.display = 'none';
                id('login').style.display = 'inline-block';
                document.title = "Login";
                id('loginField').innerHTML = '';
                id('passField').innerHTML = '';
            }
        }
    };

    var username = JSON.stringify({
        username: id('loginF').value,
        password: id('passF').value
    });

    xhr.send(username);
}

//switch screens
function createAccount() {
    id('login').style.display = 'none';
    id('createAcc').style.display = 'inline-block';
    document.title = "Create Account";
}

function backToContacts() {
    id('chatScreen').style.display = 'none';
    id('contacts').style.display = 'block';
    id('notif').style.display = 'none';
    document.title = "Contacts";
}

function backTo() {
    id('createAcc').style.display = 'none';
    id('login').style.display = 'inline-block';
}

//websocket start function
function startSocket() {
    ws = new WebSocket("ws://localhost:4567/chat");

    ws.onmessage = function (msg) {
        updateScreen(msg);
    };

    ws.onclose = function () {
        alert("Websocket closed!");
    };

    id("send").addEventListener("click", function () {
        sendMessage(id("messageField").value);
    });
    id("messageField").addEventListener("keypress", function (e) {
        if (e.keyCode === 13) {
            sendMessage(e.target.value);
        }
    });
}

function sendMessage(message) {
    if (message !== "") {
        ws.send(JSON.stringify({sender: userName, message: message, receiver: recipientName}));
        id("messageField").value = "";
    }
}

//update screen function
/** @namespace data.msg */
function updateScreen(msg) {
    console.log(msg);
    var data = JSON.parse(msg.data);
    //data has 'key' determining type of message

    if (data.key === "userlist") {  //update contacts with user list
        id('usrList').innerHTML = "";
        for (var i = 0; i < data.list.length; i++) {
            var item = document.createElement('li');
            item.setAttribute('id', 'li' + i);
            item.onclick = function () {
                startChat(this.id);
            };
            if (data.list[i].username !== userName) {
                item.onclick = function () {
                    startChat(this.id);
                };
                item.appendChild(document.createTextNode(data.list[i].username));
                //assign colour
                if (data.list[i].status === "ONLINE") {
                    item.style.color = "green";
                    console.log(item);
                } else {
                    item.style.color = "red";
                    console.log(item);
                }
            } else {
                continue;
            }
            id('usrList').appendChild(item);
        }
    } else if (data.key === "message") {
        if (!isHidden(id('chatScreen')) && data.msg.sender === userName) {
            if (data.status === "Fail") {
                alert(data.message);
            } else {
                if (data.msg.sender === userName) {
                    insert("chat", {sender: "", message: data.msg.message, time: data.time});
                    chats[userName + recipientName].push({sender: "", message: data.msg.message, time: data.time});
                } else {
                    insert("chat", {sender: data.sender, message: data.msg.message, time: data.time});
                    chats[userName + recipientName].push({
                        sender: data.sender,
                        message: data.msg.message,
                        time: data.time
                    });
                }
            }
        } else {
            recipientName = data.sender;
            if (!chats.hasOwnProperty(userName + recipientName)) {
                chats[userName + recipientName] = [];
                console.log(chats);
            }
            chats[userName + recipientName].push({sender: data.sender, message: data.msg.message, time: data.time});
            id('notif').style.display = 'block';
            id('notifText').innerHTML = 'Received a message from ' + recipientName;
            new Notification("You have received a message from " + recipientName);
        }
    }
}

function insert(targetID, message) {
    var colour = colorPick(message.sender);
    var list = id('msgList');
    var li = document.createElement('li');

    var div = document.createElement('div');
    div.setAttribute('class', '.chat .chat-history .message-data');
    div.style.marginBottom = '15px';
    div.style.textAlign = dirCheck(message.sender);

    var span = document.createElement('span');
    span.innerHTML = message.time + "      "; //current time
    span.style.color = '#a8aab1';
    span.style.paddingLeft = '6px';

    var span2 = document.createElement('span');
    span2.innerHTML = checkForSender(message);

    div.appendChild(span);
    div.appendChild(span2);

    var div2 = document.createElement('div');
    div2.style.background = colour;
    div2.style.cssFloat = dirCheck(message.sender);
    div2.style.textAlign = dirCheck(message.sender);
    if (message.sender === "") {
        div2.setAttribute('class', 'my-message');
    } else {
        div2.setAttribute('class', 'other-message');
    }
    div2.innerHTML = message.message;

    li.appendChild(div);
    li.appendChild(div2);
    list.appendChild(li);

    scrollToBottom();
}

function checkForSender(message) {
    if (message.sender === "") {
        return "";
    } else {
        return message.sender;
    }
}

function dirCheck(sender) {
    if (sender === recipientName) {
        return "left";
    } else {
        return "right";
    }
}

function colorPick(sender) {
    if (sender === recipientName) {
        return "rgb(148, 194, 237)";
    } else {
        return "rgb(119, 199, 118)";
    }
}

function startChat(item) {
    var color = window.getComputedStyle(id(item)).getPropertyValue('color');
    if (color === "rgb(0, 128, 0)") { //online
        recipientName = id(item).innerHTML;
        readMessage();
    }
}

//helper classes
function id(id) {
    return document.getElementById(id);
}

function isHidden(el) {
    return (el.offsetParent === null);
}

function ignoreMessage() {
    id('notif').style.display = 'none';
}

function readMessage() {
    if (!chats.hasOwnProperty(userName + recipientName)) {
        chats[userName + recipientName] = [];
        console.log(chats);
    }

    document.title = recipientName;
    id('talkingTo').innerHTML = recipientName;
    id('contacts').style.display = 'none';
    id('msgList').innerHTML = "";
    id('chatScreen').style.display = 'block';

    for (var i = 0; i < chats[userName + recipientName].length; i++) {
        insert('chat', chats[userName + recipientName][i]);
    }

    scrollToBottom();
}

function search() {
    var input, filter, ul, li, a;
    input = id('searchUser');
    filter = input.value.toUpperCase();
    ul = id('usrList');
    li = ul.getElementsByTagName('li');

    for (var i = 0; i < li.length; i++) {
        a = li[i];
        console.log("Item in list: " + a.innerHTML);
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function scrollToBottom() {
    id('chat').scrollTop = id('chat').scrollHeight;
}
