package com.hknight.chat;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@WebSocket
public class Handler {

    private static final Logger LOG = LoggerFactory.getLogger(Handler.class);

    @OnWebSocketConnect
    public void onConnect(Session session) {
        LOG.info("Client connected from [{}].", session.getLocalAddress());
    }
}
