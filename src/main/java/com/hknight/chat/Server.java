package com.hknight.chat;

import java.io.IOException;
import java.util.Date;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.hknight.chat.messaging.Message;
import com.hknight.chat.messaging.MessageDecoder;
import com.hknight.chat.messaging.MessageEncoder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ServerEndpoint(value = "/chat", encoders = MessageEncoder.class, decoders = MessageDecoder.class)
public class Server {

    private static final Logger LOG = LoggerFactory.getLogger(Server.class);
    private final Queue<Session> sessions = new ConcurrentLinkedQueue<>();

    @OnOpen
    public void onOpen(Session session) {
        LOG.info("{} joined server.", session.getId());
        sessions.add(session);
    }

    @OnMessage
    public void onMessage(Message message, Session session) {
        // broadcast the message
        sessions.stream().filter(Session::isOpen).forEach(e -> {
            try {
                e.getBasicRemote().sendObject(message);
            } catch (IOException | EncodeException ex) {
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
                Message message = new Message();
                message.setSender("Server");
                message.setContent((String) session.getUserProperties().get("user") + " left the chat room.");
                message.setReceived(new Date());
                e.getBasicRemote().sendObject(message);
            } catch (IOException | EncodeException ex) {
                LOG.error("Failed to send broadcast.", ex);
            }
        });
    }
}
