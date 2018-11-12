var username; // The current user's username.
var logger = id("logger"); // The DOM element where everything is logged.

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
    xhr.open("POST", "http://localhost:4567/login");
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
			
			if (data.status) {
				logger.innerHTML += data.message + "<br>";
			} else logger.innerHTML += data.message + "<br>";
		}
	};
	var account = JSON.stringify({username: username_create, password: password_create});
	xhr.send(account);
}

// Websocket connection
function socketConnect() {
    var ws = new WebSocket("ws://localhost:4567/chat");

    ws.onmessage = function(msg) {
        logger.innerHTML += "Received message: [" + msg.value + "]<br>";
        console.log(msg);
        console.log(msg.key + "|" + msg.value);
        updateScreen(msg);
    };
}

function updateScreen(msg) {

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

// Helper functions
function id(id) {
    return document.getElementById(id);
}
