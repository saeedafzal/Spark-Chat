var username; // The current user's username.
var receiver; // The user to receive messages
var logger = id("logger"); // The DOM element where everything is logged.
var ws; // Websocket
var chatHistory = {};

// HTTP Requests
// Login function + start websocket
function login() {
    logger.innerHTML = "Login attempt...<br>";
    username = id("username_input").value;
    var password = id("password_input").value;

    if (username === "" || password === "") {
        logger.innerHTML += "Enter all fields.<br>";
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4567/login/" + username);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            console.log("Received data: " + data);

            if (data.key) {
                logger.innerHTML += data.message + "<br>";
                id("login_screen").style.display = "none";
                id("contact_screen").style.display = "block";
                socketConnect();
            } else logger.innerHTML += data.message + "<br>";
        } else if (xhr.status !== 200) {
            logger.innerHTML += "Error: " + xhr.status + " code. Please check server.<br>"
        }
    };
    var account = JSON.stringify({username: username, password: password});
    xhr.send(account);
}

// Create account function
function createAccount() {
    var username_create = id("username_create").value;
    var password_create = id("password_create").value;
    var conf_pass_create = id("conf_pass_create").value;

    if (username_create === "" || password_create === "" || conf_pass_create === "") {
        logger.innerHTML += "Enter all fields.<br>";
        return;
    }
    if (password_create !== conf_pass_create) {
        logger.innerHTML += "Passwords do not match.<br>";
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4567/create");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            console.log("Received data.");

            if (data.key) {
                logger.innerHTML += data.message + "<br>";
                id("create_screen").style.display = "none";
                id("login_screen").style.display = "block";
            } else logger.innerHTML += data.message + "<br>";
        }
    };
    var account = JSON.stringify({username: username_create, password: password_create});
    xhr.send(account);
}

// Logout
function logout() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4567/logout");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            console.log("Received data.");

            if (data.key) {
                logger.innerHTML += data.message + "<br>";
                for (var i=0; i < document.getElementsByTagName("body")[0].children.length; i++) {
                    document.getElementsByTagName("body")[0].children[i].style.display = "none";
                }

                ws.close();

                id("login_screen").style.display = "block";
            } else logger.innerHTML += data.message + "<br>";
        }
    };

    xhr.send(username);
}

// Websocket connection
function socketConnect() {
    ws = new WebSocket("ws://localhost:4567/chat");

    ws.onmessage = function (msg) {
        var data = JSON.parse(msg.data);
        logger.innerHTML += "Received message: [" + data.key + "]<br>";
        console.log(data);
        updateScreen(data);
    };

    ws.onclose = function () {
        logger.innerHTML += "Connection closed.<br>";
    };

    id("chat_send").addEventListener("click", () => {
        sendMessage(id("chat_input").value);
    });

    id("chat_input").addEventListener("keypress", (e) => {
        if (e.keyCode === 13) sendMessage(e.target.value);
    });
}

function sendMessage(message) {
    if (message !== "") {
        ws.send(JSON.stringify(
            {sender: username, recipient: receiver, message: message}
        ));
        id("chat_input").value = "";
    }
}

function updateScreen(data) {
    // Check msg type
    if (data.key === "userlist") {
        id("all_users_list").innerHTML = "";
        // Message is a userlist
        for (var i=0; i < data.value.length; i++) {
            // Check for own account
            if (data.value[i].username === username) continue;

            var li = document.createElement("li");
            var nameDiv = document.createElement("div");

            nameDiv.innerHTML = data.value[i].username;
            var statusDiv = document.createElement("div");
            statusDiv.innerHTML = data.value[i].status;

            li.appendChild(nameDiv);
            li.appendChild(statusDiv);

            li.onclick = function () {
                startChat(this);
            };

            id("all_users_list").appendChild(li);
        }
    } else if (data.key === "message") {
        // Check if in chat screen with the correct person
        if ((receiver === data.recipient || receiver === data.sender) && !isHidden(id("chat_screen"))) {
            // Check if it is a message we send or received
            if (data.sender === username) {
                // Message we sent
                insertMessage(null, data.message);
            } else {
                // Message we receive
                insertMessage(data.sender, data.message)
            }

            chatHistory[receiver].push(
                {sender: data.sender === username ? "" : data.sender, message: data.message}
            );
        }
    }
}

function insertMessage(name, message) {
    var li = document.createElement("li");
    var div;

    if (name !== "") {
        div = document.createElement("div");
        div.innerHTML = name;
        li.appendChild(div);
    }

    div = document.createElement("div");
    div.innerHTML = message;

    li.appendChild(div);

    id("chat_history").appendChild(li);
}

function startChat(element) {
    if (element.children[1].innerHTML === "ONLINE") {
        id("chat_history").innerHTML = "";
        receiver = element.children[0].innerHTML;
        console.log(receiver);
        logger.innerHTML += "Start chat with [" + receiver + "]<br>";

        id("chat_title").innerHTML = receiver;
        id("contact_screen").style.display = "none";
        id("chat_screen").style.display = "block";

        populateChatHistory();
    }
}

function populateChatHistory() {
    if (chatHistory.hasOwnProperty(receiver)) {
        // Chat history exists
        chatHistory[receiver].forEach(message => {
            insertMessage(message.sender, message.message);
        });
    } else {
        chatHistory[receiver] = [];
    }
}

// Switch screen functions
function displayCreateAccount() {
    id("login_screen").style.display = "none";
    id("create_screen").style.display = "block";
}

function backToLogin() {
    id("create_screen").style.display = "none";
    id("login_screen").style.display = "block";
}

function backToContacts() {
    id("chat_screen").style.display = "none";
    id("contact_screen").style.display = "block";
}

// Helper functions
function id(id) {
    return document.getElementById(id);
}

function isHidden(el) {
    return (el.offsetParent === null);
}

function search() {
    var input, filter, ul, li;
    input = id('search_user');
    filter = input.value.toUpperCase();
    ul = id('all_users_list');
    li = ul.getElementsByTagName('li');

    for (var a of li) {
        console.log("Item in list: " + a.children[0].innerHTML);
        if (a.children[0].innerHTML.toUpperCase().indexOf(filter) > -1) a.style.display = "";
        else a.style.display = "none";
    }
}
