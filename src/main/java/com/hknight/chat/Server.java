package com.hknight.chat;

import java.io.IOException;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServerEndpoint(value = "/chat")
public class Server {

    private static final Logger LOG = LoggerFactory.getLogger(Server.class);
    private static final Queue<Session> sessions = new ConcurrentLinkedQueue<>();

    @OnOpen
    public void onOpen(Session session) {
    	// Set websocket timeout
    	session.setMaxIdleTimeout(0);
    	
        LOG.info("{} joined server.", session.getId());
        sessions.add(session);
        LOG.info("Current size of users in session list: {}", sessions.size());
        sessions.forEach(e -> LOG.info(e.getId()));
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        LOG.info("Received message from {}: {}", session.getId(), message);
        // broadcast the message
        sessions.stream().filter(Session::isOpen).forEach(e -> {
            try {
                e.getBasicRemote().sendText(session.getId() + ": " + message);
            } catch (IOException ex) {
                LOG.error("Failed to send broadcast.", ex);
            }
        });
    }

    @OnClose
    public void onClose(Session session) throws IOException, EncodeException {
        LOG.info("{} left the server.", session.getId());
        sessions.remove(session);
        // notify peers about leaving the chat room
        sessions.stream().filter(Session::isOpen).forEach(e -> {
            try {
                String message = "Server: " + (String) session.getUserProperties().get("user") + " disconnected.";
                e.getBasicRemote().sendText(message);
            } catch (IOException ex) {
                LOG.error("Failed to send broadcast.", ex);
            }
        });
        
        LOG.info("Current size of users in session list: {}", sessions.size());
        sessions.forEach(e -> LOG.info(e.getId()));
    }
}
