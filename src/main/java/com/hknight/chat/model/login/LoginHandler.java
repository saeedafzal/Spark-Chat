package com.hknight.chat.model.login;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import javax.annotation.Nonnull;

import org.eclipse.jetty.websocket.api.Session;

import com.hknight.chat.model.MessageTypes;
import com.hknight.chat.model.ServerResponse;

public class LoginHandler {

    private final ConcurrentMap<String, String> userList = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Session> onlineUsers = new ConcurrentHashMap<>();
    
    public LoginHandler() {
        // Place dummy orders
        userList.put("Demo", "demo");
        userList.put("Saeed", "saeed");
        userList.put("HouFai", "houfai");
    }
    
    public ServerResponse login(@Nonnull LoginRequest request, @Nonnull Session session) {
        final String password = userList.get(request.getUsername());
        
        if (password == null) {
            // Username does not exist
            return new ServerResponse(MessageTypes.LOGIN_REQUEST, false, "User does not exist!");
        } else {
            if (password.equals(request.getPassword())) {
                // Valid. Logged in.
                onlineUsers.put(request.getUsername(), session);
                return new ServerResponse(MessageTypes.LOGIN_REQUEST, true, "User has logged in.");
            } else {
                // Password does not match
                return new ServerResponse(MessageTypes.LOGIN_REQUEST, false, "Passwords do not match.");
            }
        }
    }
}
