var message_types = {
	LOGIN_REQUEST: "LOGIN_REQUEST",
	CREATE_ACCOUNT_REQUEST: "CREATE_ACCOUNT_REQUEST",
	LOGOUT_REQUEST: "LOGOUT_REQUEST",
	USER_LIST: "USER_LIST",
	MESSAGE: "MESSAGE"
};
var websocket;
var username;
var recipient;

function initWebSocket() {
    log("Connecting to the server...");
    websocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/chat");

    websocket.onopen = function() {
		log("Done. Connected.");
    }
    
    websocket.onmessage = function(message) {
    	var data = JSON.parse(message.data);
    	log("Received message from server: " + data);
    	
    	if (data.messageType == message_types.LOGIN_REQUEST) {
    		if (data.status) {
    			log("Successfully logged in.");
    			
    			id("login").style.display = "none";
    			id("contacts").style.display = "block";
    			
    			websocket.send(JSON.stringify(
    				{key: message_types.USER_LIST}
    			));
    		} else {
    			log("Could not log in: " + data.message);
    		}
    	} else if (data.messageType == message_types.USER_LIST) {
    		data.userlist.forEach(e => {
    			if (e != username) {
        			var li = document.createElement("li");
        			li.onclick = function() {
        				toggleChat(this.textContent);
        			}
        			li.innerHTML = e;
        			id("userlist").appendChild(li);
    			}
    		});
    	} else {
    		if (username == data.sender) {
    			log(username + ": [" + data.message + "]");
    			var li = document.createElement("li");
    			li.innerHTML = username + ": [" + data.message + "]";
    			
    			id("chat_history").appendChild(li);
    		} else {
    			log(recipient + ": [" + data.message + "]");
    			var li = document.createElement("li");
    			li.innerHTML = recipient + ": [" + data.message + "]";
    			
    			id("chat_history").appendChild(li);
    		}
    	}
    }
}

function login() {
	var username = id("username_input").value;
	var password = id("password_input").value;
	
	websocket.send(JSON.stringify(
		{key: message_types.LOGIN_REQUEST, username: username, password: password}
	));
	
	log("Sent login request for: [" + username + "].");
	this.username = username;
}

function toggleChat(user) {
	id("contacts").style.display = "none";
	id("chat").style.display = "block";
	recipient = user;
}

function sendMessage() {
	var message = id("message_input").value;
	
	if (message != "") {
		websocket.send(JSON.stringify(
			{key: message_types.MESSAGE, message: message, sender: username, recipient: recipient}
		));
	}
}

// Helper functions
function id(id) {
    return document.getElementById(id);
}

function log(message) {
    console.log(message);
    id("logger").innerHTML += message + "<br/>";
}

initWebSocket();
