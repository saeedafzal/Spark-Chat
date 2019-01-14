var message_types = {
	LOGIN_REQUEST: "LOGIN_REQUEST",
	CREATE_ACCOUNT_REQUEST: "CREATE_ACCOUNT_REQUEST",
	LOGOUT_REQUEST: "LOGOUT_REQUEST"
};
var websocket;

function initWebSocket() {
    log("Connecting to the server...");
    websocket = new WebSocket("ws://localhost:4567/chat");

    websocket.onopen = function() {
		log("Done. Connected.");
    }
    
    websocket.onmessage = function(message) {
    	var data = JSON.parse(message.data);
    	log("Received message from server: " + data);
    	
    	if (data.messageType == message_types.LOGIN_REQUEST) {
    		if (data.status) {
    			log("Successfully logged in.");
    			// TODO: switch to login screen
    		} else {
    			log("Could not log in: " + data.message);
    		}
    	}
    }
}

function login() {
	var username = id("username_input").value;
	var password = id("password_input").value;
	
	websocket.send(JSON.stringify(
		{key: message_types.LOGIN_REQUEST, username: dummyUsername, password: dummyPassword}
	));
	
	log("Sent login request for: [" + dummyUsername + "].");
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
