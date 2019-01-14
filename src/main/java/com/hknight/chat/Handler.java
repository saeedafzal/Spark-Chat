package com.hknight.chat;

import java.io.IOException;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import com.hknight.chat.model.MessageTypes;
import com.hknight.chat.model.ServerResponse;
import com.hknight.chat.model.SparkMessage;
import com.hknight.chat.model.login.LoginHandler;
import com.hknight.chat.model.login.LoginRequest;

@WebSocket
public class Handler {

    private static final Logger LOG = LoggerFactory.getLogger(Handler.class);
    private final LoginHandler loginHandler = new LoginHandler();
    private final Gson gson = new GsonBuilder().create();
    
    @OnWebSocketConnect
    public void onConnect(Session session) {
        LOG.info("Client connected from [{}].", session.getLocalAddress());
    }
    
    @OnWebSocketMessage
    public void onMessage(Session session, String message) {
        LOG.info("Reeived new message from [{}]: [{}]", session.getLocalAddress(), message);
        final SparkMessage sparkMessage = gson.fromJson(message, SparkMessage.class);
        
        if (sparkMessage.getKey() == MessageTypes.LOGIN_REQUEST) {
            final LoginRequest loginRequest =  gson.fromJson(message, LoginRequest.class);
            LOG.info("Received login request: {}.", loginHandler);
            
            // TODO: Validation checks
            
            final ServerResponse response = loginHandler.login(loginRequest, session);
            LOG.info("Generated response: {}", response);
            
            try {
                session.getRemote().sendString(gson.toJson(response));
                LOG.info("Sent response to client.");
            } catch (IOException io) {
                LOG.error("Failed to send response to client.", io);
            }
        }
    }
}
