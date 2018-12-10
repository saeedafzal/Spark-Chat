var username; // The current user's username.
var receiver; // The user to receive messages
// var logger = id("logger"); // The DOM element where everything is logged.
var ws; // Websocket
var chatHistory = {};

function getNotificationPermissions() {
	if (Notification.permission != "granted") {
		Notification.requestPermission().then(permission => {
			console.log("Notification access granted.");
		});
	}
}

// HTTP Requests
// Login function + start websocket
function login() {
    id("login_log").innerHTML = "Login attempt...";
    username = id("username_input").value;
    var password = id("password_input").value;

    if (username === "" || password === "") {
        id("login_log").innerHTML = "Enter all fields.";
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
            	id("login_log").innerHTML = data.message;
                id("login_screen").style.display = "none";
                id("contact_screen").style.display = "block";
            	id("login_log").innerHTML = "";
                socketConnect();
            } else {
                id("login_log").innerHTML = data.message;
            }
        } else if (xhr.status !== 200) {
            id("login_log").innerHTML = "Error: " + xhr.status + " code. Please check server.";
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
        id("create_log").innerHTML = "Enter all fields.";
        return;
    }
    if (password_create !== conf_pass_create) {
        id("create_log").innerHTML = "Passwords do not match.";
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
                id("create_screen").style.display = "none";
                id("login_screen").style.display = "block";
            } else {
            	id("create_log").innerHTML = data.message;
            }
        } else {
        	id("create_log").innerHTML = "Error: " + xhr.status + " code. Please check server.";
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
                for (var i = 0; i < document.getElementsByTagName("body")[0].children.length; i++) {
                    document.getElementsByTagName("body")[0].children[i].style.display = "none";
                }

                ws.close();

                id("login_log").innerHTML = "";
            	id("create_log").innerHTML = "";
                id("login_screen").style.display = "block";
            }
        }
    };

    xhr.send(username);
}

// Websocket connection
function socketConnect() {
    ws = new WebSocket("ws://localhost:4567/chat");

    ws.onmessage = function (msg) {
        var data = JSON.parse(msg.data);
        console.log(data);
        updateScreen(data);
    };

    ws.onclose = function () {
        console.log("Connection closed.");
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
        } else {
        	spawnNotification("New Message!", "New message from " + data.sender);
        }
    }
}

function spawnNotification(title, body) {
	var options = {body: body};
	var n = new Notification(title, options);
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
    	li.className = " clear";
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
        console.log("Start chat with " + receiver);

        id("chat_title").innerHTML = receiver;
        id("contact_screen").style.display = "none";
        id("chat_screen").style.display = "block";

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
	id("login_log").innerHTML = "";
	id("create_log").innerHTML = "";
    id("login_screen").style.display = "none";
    id("create_screen").style.display = "block";
}

function backToLogin() {
	id("login_log").innerHTML = "";
	id("create_log").innerHTML = "";
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

getNotificationPermissions();
