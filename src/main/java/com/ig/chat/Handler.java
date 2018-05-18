package com.ig.chat;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ig.chat.json.MessageJson;
import com.ig.chat.json.UserListJson;
import com.ig.chat.model.Account;
import com.ig.chat.model.Message;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@WebSocket
public class Handler {
    private static final Logger LOG = LoggerFactory.getLogger(Handler.class); //Logger
    private final Gson gson = new GsonBuilder().create();
    private final Queue<Session> sessions = new ConcurrentLinkedQueue<>(); //for broadcasts
    private Map<Account, Session> onlineUsers = new HashMap<>();
    private Map<String, List<Message>> chatHistory = new HashMap<>();

    @OnWebSocketConnect
    public void onConnect(Session session) {
        LOG.info("{} joined Server!", session.getLocalAddress());
        onlineUsers.put(Server.account, session);
        sessions.add(session);
        session.setIdleTimeout(28800000);

        for (Account acc : Server.userList) {
            for (Account a : onlineUsers.keySet()) {
                if (acc.getUsername().equals(a.getUsername())) {
                    acc.setStatus("ONLINE");
                    break;
                }
            }
            if (acc.getStatus() == null || !acc.getStatus().equals("ONLINE")) {
                acc.setStatus("OFFLINE");
            }
        }

        broadcast();
    }

    @OnWebSocketClose
    public void onClose(Session session, int statusCode, String reason) {
        LOG.info("{}, Status Code: {}, Reason: {}", session.getLocalAddress(), statusCode, reason);
        sessions.remove(session);
        onlineUsers.remove(Server.account);

        for (int i = 0; i < Server.userList.size(); i++) {
            if (Server.account.getUsername().equals(Server.userList.get(i).getUsername())) {
                Server.userList.get(i).setStatus("OFFLINE");
                break;
            }
        }

        broadcast();
    }

    @OnWebSocketMessage
    public void onMessage(Session session, String message) {
        if (!message.equals("ping")) {
            final Message msg = gson.fromJson(message, Message.class);
            LOG.info("{}", msg);

            final Session receiverSession = getReceiverSession(msg); //session to send to
            try {
                if (receiverSession == null) {
                    msg.setStatus("FAIL");
                    msg.setMessage("No user to send to");
                    session.getRemote().sendString(gson.toJson(msg));
                } else {
                    final MessageJson mj = new MessageJson("message", msg, msg.getSender(), msg.getReceiver(), getTime());
                    receiverSession.getRemote().sendString(gson.toJson(mj));
                    session.getRemote().sendString(gson.toJson(mj));
                }
            } catch (IOException io) {
                LOG.error("Failed to send message!", io);
            }
        } else {
            LOG.info("{}", message);
        }
    }

    //get sessions to send message to
    private Session getReceiverSession(Message msg) {
        Session session = null;
        for (Account u : onlineUsers.keySet()) {
            if (u.getUsername().equals(msg.getReceiver())) {
                session = onlineUsers.get(u);
            }
        }
        return session;
    }

    //get current time
    private String getTime() {
        LocalDateTime dateTime = LocalDateTime.now();

        int hour = dateTime.getHour();
        System.out.println("Hour: " + hour);

        int minute = dateTime.getMinute();
        System.out.println("Minute: " + minute);

        String time = Integer.toString(hour) + ":" + Integer.toString(minute);
        System.out.println("Time: " + time);

        return time;
    }

    //broadcast
    private void broadcast() {
        sessions.stream().filter(Session::isOpen).forEach(s -> {
            try {
                s.getRemote().sendString(gson.toJson(new UserListJson("userlist", Server.userList)));
            } catch (IOException io) {
                LOG.error("Could not send user list!", io);
            }
        });
    }
}
