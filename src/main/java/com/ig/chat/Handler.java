package com.ig.chat;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.TimeUnit;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ig.chat.model.Message;
import com.ig.chat.model.Response;
import com.ig.chat.model.UserListJson;

@WebSocket
public class Handler {

    private static final Logger LOG = LoggerFactory.getLogger(Handler.class);
    private Map<String, Session> userSessions = new HashMap<>();
    private Gson gson = new GsonBuilder().create();
    private Login login = Login.getInstance();

    @OnWebSocketConnect
    public void onConnect(Session session) {
        LOG.info("{} joined the server!", session.getLocalAddress());
        // Set timeout to one day for each connected session
        session.setIdleTimeout(TimeUnit.DAYS.toMillis(1));

        login.getSessions().add(session);
        userSessions.put(login.getCurrentUserName(), session);

        login.broadcastUserList();
    }

    @OnWebSocketMessage
    public void onMessage(Session session, String message) {
        final Message incomingMessage = gson.fromJson(message, Message.class);
        LOG.info("Received new (chat) message: {}", incomingMessage);
        
        try {
	        final Session receiver = userSessions.get(incomingMessage.getRecipient());
	        
	        if (receiver == null) {
	        	session.getRemote().sendString(gson.toJson(new Response(false, "Could not find recipient to send message to.")));
	        } else {
	        	incomingMessage.setKey("message");
	        	incomingMessage.setTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
	        	receiver.getRemote().sendString(gson.toJson(incomingMessage));
	        	session.getRemote().sendString(gson.toJson(incomingMessage));
	        	LOG.info("Sent message to recipient.");
	        }
        } catch (IOException io) {
        	LOG.error("Failed to send message to client.", io);
        }
    }

    @OnWebSocketClose
    public void onClose(Session session, int statusCode, String reason) {
        LOG.info("Connection closed:\n\tStatus Code: {}\n\tReason: {}", statusCode, reason);
        login.getSessions().remove(session);
        userSessions.values().remove(session);

        login.broadcastUserList();
    }
}
