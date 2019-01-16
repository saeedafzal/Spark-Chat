var websocket;

function init() {
    id("input").addEventListener("keypress", (e) => {
        if (e.keyCode == 13) sendMessage();
    });
    
    websocket = new WebSocket("ws://" + location.host + location.pathname + "chat");
    
    websocket.onopen = function() {
        console.log("Websocket connection established.");
        id("chat_history").innerHTML += "Connected to server." + "\n";
    }
    
    websocket.onmessage = function(msg) {
        console.log("Received message: " + msg.data);
        id("chat_history").innerHTML += msg.data + "\n";
        scrollToBottom();
    }
    
    websocket.onclose = function() {
        alert("Connection closed.");
        console.log("Connection closed.");
    }
}

function sendMessage() {
    websocket.send(id("input").value);
    id("input").value = "";
}

function id(id) {
    return document.getElementById(id);
}

function scrollToBottom() {
    id("chat_history").scrollTop = id("chat_history").scrollHeight;
}

init();
