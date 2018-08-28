//global variables
var userName;
var recipientName;
var ws;
var chats = {};
var clickedEl;
var currentContacts = [];

//hide divs
id('con').style.display = 'none';
id('chatScreen').style.display = 'none';
// id('notif').style.display = 'none';
id('createAcc').style.display = 'none';
id('loginField').value = localStorage.getItem("username");
id('passField').value = localStorage.getItem("password");

document.addEventListener("click", function () {
    document.getElementById("rmenu").className = "hide";
});

//http requests
function login() {
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
                document.body.style.padding = '0';
                id('con').style.display = 'block';
                document.body.style.background = '';
                document.title = 'Contacts';
                startSocket();
                // userList();
                alert("LOGGED IN!");
            } else alert(json.message);
        }
    };
    userName = id('loginField').value;
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
            } else alert(json.message);
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
                document.body.style.padding = '40px 0';
                id('login').style.display = 'inline-block';
                document.body.style.background = 'url("images/backgroundBlur.jpg")';
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
    document.body.style.padding = '0';
    id('createAcc').style.display = 'inline-block';
    document.title = "Create Account";
}

function backToContacts() {
    id('chatScreen').style.display = 'none';
    id('con').style.display = 'block';
    document.body.style.background = '';
    // id('notif').style.display = 'none';
    document.title = "Contacts";
}

function backTo() {
    id('createAcc').style.display = 'none';
    document.body.style.padding = '40px 0';
    id('login').style.display = 'inline-block';
    document.body.style.background = 'url("images/backgroundBlur.jpg")';
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
        if (e.keyCode === 13) sendMessage(e.target.value);
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
            var avatarDiv = document.createElement('div');
            avatarDiv.className = 'avatDiv';
            var infoDiv = document.createElement('div');
            infoDiv.className = 'infoDiv';
            infoDiv.id = 'li' + i;
            infoDiv.onclick = function() {
                startChat(this.id);
            };
            var addDiv = document.createElement('div');
            addDiv.className = 'addDiv';
            addDiv.innerHTML = '+';
            addDiv.onclick = function() {
                addToFav(this.parentNode.children[1].innerHTML.substring(0, this.parentNode.children[1].innerHTML.indexOf('<')));
            };
            
            item.className = 'searchUsr';
            if (data.list[i].username !== userName) {
                infoDiv.innerHTML = data.list[i].username;
                if (data.list[i].status === 'ONLINE') {
                    infoDiv.innerHTML += '</br>ONLINE';
                    infoDiv.style.color = 'green';
                } else {
                    infoDiv.innerHTML += '</br>OFFLINE';
                    infoDiv.style.color = 'red';
                }
            } else continue;
            
            item.appendChild(avatarDiv);
            item.appendChild(infoDiv);
            item.appendChild(addDiv);
            
            id('usrList').appendChild(item);
        }
    } else if (data.key === "message") {
        if (data.sender === userName) { // Display own message
            recipientName = data.receiver;
            if (!chats.hasOwnProperty(userName + data.receiver)) chats[userName + data.receiver] = [];
            chats[userName + data.receiver].push({sender: "", message: data.msg.message, time: data.time});
            insert("chat", {sender: "", message: data.msg.message, time: data.time});
        } else { // Display other message
            if (isHidden(id('chatScreen'))) { // In contacts screen
                if (!chats.hasOwnProperty(userName + data.sender)) chats[userName + data.sender] = [];
                var liList = document.getElementsByClassName('searchUsr');
                for (var i = 0; i < liList.length; i++) {
                    if (liList[i].textContent === data.sender) {
                        userListPending(liList[i]);
                        break;
                    }
                }
                chats[userName + data.sender].push({sender: data.sender, message: data.msg.message, time: data.time});
                notify(data.sender);
            } else {
                recipientName = data.sender;
                if (id('talkingTo').innerHTML === data.sender) { // Chat screen with sender
                    if (!chats.hasOwnProperty(userName + data.sender)) chats[userName + data.sender] = [];
                    chats[userName + recipientName].push({sender: data.sender, message: data.msg.message, time: data.time});
                    insert("chat", {sender: data.sender, message: data.msg.message, time: data.time});
                } else { // Chat screen with someone else
                    if (!chats.hasOwnProperty(userName + data.sender)) chats[userName + data.sender] = [];
                    chats[userName + recipientName].push({sender: data.sender, message: data.msg.message, time: data.time});
                    var liList = document.getElementsByClassName('searchUsr');
                    for (var i = 0; i < liList.length; i++) {
                        if (liList[i].textContent === data.sender) {
                            userListPending(liList[i]);
                            break;
                        }
                    }
                }
            }
        }
    }
}

function notify(sender) {
    Notification.permission = undefined;
    if (window.Notification && Notification.permission !== "denied") {
        Notification.requestPermission(function() {  // status is "granted", if accepted by user
            new Notification('New Message Received', {
                body: 'Received message from ' + sender
            });
        });
    }
}

function userListPending(e) {
    if (id(e.textContent)) id(e.textContent).style.display = 'block';
    else {
        var div = document.createElement('div');
        div.className = 'indication';
        div.setAttribute('id', e.textContent);
        e.appendChild(div);
    }
}

function mouseX(evt) {
    if (evt.pageX) {
        return evt.pageX;
    } else if (evt.clientX) {
        return evt.clientX + (document.documentElement.scrollLeft ?
            document.documentElement.scrollLeft :
            document.body.scrollLeft);
    } else {
        return null;
    }
}

function mouseY(evt) {
    if (evt.pageY) {
        return evt.pageY;
    } else if (evt.clientY) {
        return evt.clientY + (document.documentElement.scrollTop ?
            document.documentElement.scrollTop :
            document.body.scrollTop);
    } else {
        return null;
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
    if (message.sender === "") div2.setAttribute('class', 'my-message');
    else div2.setAttribute('class', 'other-message');
    div2.innerHTML = message.message;

    li.appendChild(div);
    li.appendChild(div2);
    list.appendChild(li);

    scrollToBottom();
}

function checkForSender(message) {
    if (message.sender === "") return "";
    else return message.sender;
}

function dirCheck(sender) {
    if (sender === recipientName) return "left";
    else return "right";
}

function colorPick(sender) {
    if (sender === recipientName) return "rgb(148, 194, 237)";
    else return "rgb(119, 199, 118)";
}

function startChat(item) {
    if (id(id(item).innerHTML.substring(0, id(item).innerHTML.indexOf('<')))) {
        id(id(item).innerHTML.substring(0, id(item).innerHTML.indexOf('<'))).style.display = 'none';
    }
    var color = window.getComputedStyle(id(item)).getPropertyValue('color');
    if (color === "rgb(0, 128, 0)") { //online
        recipientName = id(item).innerHTML.substring(0, id(item).innerHTML.indexOf('<'));
        readMessage();
    }
}

//this.parentNode.children[1].innerHTML

//helper classes
function id(id) {
    return document.getElementById(id);
}

function isHidden(el) {
    return (el.offsetParent === null);
}

/*function ignoreMessage() {
    id('notif').style.display = 'none';
}*/

function focusCss() {

}

function readMessage() {
    /*if (!chats.hasOwnProperty(userName + recipientName)) {
        chats[userName + recipientName] = [];
        console.log(chats);
    }*/

    document.title = recipientName;
    id('talkingTo').innerHTML = recipientName;
    id('con').style.display = 'none';
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
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) li[i].style.display = "";
        else li[i].style.display = "none";
    }
}

function scrollToBottom() {
    id('chat').scrollTop = id('chat').scrollHeight;
}

function addToFav(e) {
    for (var i = 0; i < currentContacts.length; i++) {
        if (currentContacts[i] === e) {
            alert("User added already!");
            return;
        }
    }
    var li = document.createElement('li');
    li.innerHTML = e;
    id('con-list').appendChild(li);
    currentContacts.push(li.innerHTML);
}

function hideContext() {
    id('rmenu').className = 'hide';
}

//contacts list functions