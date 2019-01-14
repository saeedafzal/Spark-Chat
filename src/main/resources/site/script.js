var websocket = {
    ws: new WebSocket("ws://" + location.hostname + ":" + location.port + "/chat"),
    onMessage: this.ws.onmessage = function(msg) {
        console.log("Received message.");
    },
    onClose: this.ws.onclose = function() {
        console.log("WebSocket closed.");
        alert("WebSocket closed.");
    }
};

// Helper function
function id(id) {
    return document.getElementById(id);
}
