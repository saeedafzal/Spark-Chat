package com.hknight.chat;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

@WebSocket
public class Handler {

    
    
    @OnWebSocketConnect
    public void onConnect(Session session) {
        
    }
}
