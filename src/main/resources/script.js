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
                for (var i = 0; i < document.getElementsByTagName("body")[0].children.length; i++) {
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
        id("chat_input").value = "";
    });

    id("chat_input").addEventListener("keypress", (e) => {
        if (e.keyCode === 13) {
            sendMessage(e.target.value);
            id("chat_input").value = "";
            e.preventDefault();
        }
    });
}

function sendMessage(message) {
    if (message !== "") {
        ws.send(JSON.stringify(
            {sender: username, recipient: receiver, message: message}
        ));
    }
}

function updateScreen(data) {
    // Check msg type
    if (data.key === "userlist") {
        id("all_users_list").innerHTML = "";
        // Message is a userlist
        for (var i = 0; i < data.value.length; i++) {
            // Check for own account
            if (data.value[i].username === username) continue;

            var li = document.createElement("li");

            var avatarDiv = document.createElement("div");
            avatarDiv.innerHTML = data.value[i].username[0];

            var nameDiv = document.createElement("div");
            nameDiv.id = "contact_name_list";
            nameDiv.innerHTML = data.value[i].username;

            var statusDiv = document.createElement("div");
            statusDiv.innerHTML = data.value[i].status;
            if (statusDiv.innerHTML === "ONLINE") {
                statusDiv.style.color = "green";
            } else statusDiv.style.color = "red";

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
            insertMessage(data.sender, data);
            chatHistory[receiver].push(
                {sender: data.sender === username ? "" : data.sender, message: data.message, time : data.time}
            );
        }
    }
}

function insertMessage(name, message) {
    var li = document.createElement("li");
    
    /* --------------Header-------------- */
    var divHeader = document.createElement("div");
    divHeader.className = "message-data";
    var timeSpan = document.createElement("span");
    timeSpan.className = "message-data-time";
    timeSpan.innerHTML = message.time + "                  ";
    var nameSpan = document.createElement("span");
    nameSpan.innerHTML = name === "" || name === username ? username : name;
    /* --------------------------------- */

    var chatEntryDiv = document.createElement("div");
    chatEntryDiv.className = "message my-message";
    chatEntryDiv.innerHTML = "              " + message.message + "            ";

    if (name === username || name === "") {
    	li.className = "clear";
    	divHeader.className = "message-data align-right";
    	chatEntryDiv.className = "message other-message float-right";
    	
    	divHeader.appendChild(nameSpan);
    	divHeader.innerHTML += "                  ";
    	divHeader.appendChild(timeSpan);
    } else {
    	divHeader.appendChild(timeSpan);
        divHeader.innerHTML += "                  ";
        divHeader.appendChild(nameSpan);
    }
    
    li.appendChild(divHeader);
    li.appendChild(chatEntryDiv);

    id("chat_history").appendChild(li);
    
    scrollToBottom();
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
        id("logger").style.display = "none";

        populateChatHistory();
        
        scrollToBottom();
     }
}

function populateChatHistory() {
    if (chatHistory.hasOwnProperty(receiver)) {
        // Chat history exists
        chatHistory[receiver].forEach(message => {
            insertMessage(message.sender, message);
        });
    } else {
        chatHistory[receiver] = [];
    }
}

// Switch screens functions
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

function cls(clsName) {
	return document.getElementsByClassName(clsName)[0];
}

function isHidden(el) {
    return (el.offsetParent === null);
}

function search() {
    var input = id('search_user');
    var filter = input.value.toUpperCase();
    var ul = id('all_users_list');
    var li = ul.getElementsByTagName('li');

    for (var a of li) {
        console.log("Item in list: " + a.children[0].innerHTML);
        if (a.children[0].innerHTML.toUpperCase().indexOf(filter) > -1) a.style.display = "";
        else a.style.display = "none";
    }
}

function scrollToBottom() {
	cls("chat_history").scrollTop = cls("chat_history").scrollHeight;
}
