package com.ig.chat;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ig.chat.model.Message;
import com.ig.chat.model.UserListJson;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.TimeUnit;

@WebSocket
public class Handler {

    private static final Logger LOG = LoggerFactory.getLogger(Handler.class);
    private Queue<Session> sessions = new ConcurrentLinkedQueue<>();
    private Gson gson = new GsonBuilder().create();
    private Login login = Login.getInstance();

    @OnWebSocketConnect
    public void onConnect(Session session) {
        LOG.info("{} joined the server!", session.getLocalAddress());
        // Set timeout to one day for each connected session
        session.setIdleTimeout(TimeUnit.DAYS.toMillis(1));

        sessions.add(session);

        broadcastUserList();
    }

    @OnWebSocketMessage
    public void onMessage(Session session, String message) {
        final Message incomingMessage = gson.fromJson(message, Message.class);
        LOG.info("Received new (chat) message: {}", incomingMessage);
    }

    @OnWebSocketClose
    public void onClose(Session session, int statusCode, String reason) {
        LOG.info("Connection closed:\n\tStatus Code: {}\n\tReason: {}", statusCode, reason);
        sessions.remove(session);

        broadcastUserList();
    }

    // Broadcasts user list to all online users
    private void broadcastUserList() {
        sessions.stream().filter(Session::isOpen).forEach(session -> {
            try {
                session.getRemote().sendString(gson.toJson(new UserListJson("userlist", login.getUserList())));
            } catch (IOException io) {
                LOG.error("Failed to send broadcast, could not send to: {}", session.getLocalAddress());
            }
        });
    }
}
