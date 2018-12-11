package com.ig.chat;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.eclipse.jetty.websocket.api.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ig.chat.model.Account;
import com.ig.chat.model.AccountEntry;
import com.ig.chat.model.LoginException;
import com.ig.chat.model.Response;
import com.ig.chat.model.Status;
import com.ig.chat.model.UserListJson;

class Login {

    private static final Logger LOG = LoggerFactory.getLogger(Login.class);
    private static Login login_instance = null;
    private List<Account> onlineUsers = new ArrayList<>();
    private List<Account> userList = new ArrayList<>();
    private String currentUserName;
    private Queue<Session> sessions = new ConcurrentLinkedQueue<>();
    private Gson gson = new GsonBuilder().create();

    static Login getInstance() {
        if (login_instance == null) login_instance = new Login();
        return login_instance;
    }

    // Attempts to log in the specified user and fails if it cannot login.
    Response login(AccountEntry account) throws LoginException {
        // Check if username exists.
        for (Account userListAccount : userList) {
            if (account.getUsername().equals(userListAccount.getUsername())) {
                LOG.info("User exists.");
                // Check if user is not online
                if (userListAccount.getStatus() == Status.ONLINE) {
                    LOG.warn("User is already online.");
                    throw new LoginException("User is already online!");
                } else {
                    // Check if password matches
                    if (account.getPassword().equals(userListAccount.getPassword())) {
                        LOG.info("User logged in.");
                        userListAccount.setStatus(Status.ONLINE);
                        onlineUsers.add(userListAccount);
                        return new Response(true, "User logged in.");
                    } else {
                        LOG.warn("Incorrect password.");
                        throw new LoginException("Incorrect Password!");
                    }
                }
            }
        }

        LOG.warn("User does not exist!");
        throw new LoginException("User does not exist.");
    }


    // Attempts to create a new account and fails if it cannot create.
    Response createAccount(String username, String password) throws LoginException {
        // Check if username already exists
        for (Account userListAccount : userList) {
            if (username.equals(userListAccount.getUsername())) {
                // Username exists
                LOG.warn("User already exists.");
                throw new LoginException("User already exists.");
            }
        }

        LOG.info("Created user: {}", username);
        userList.add(new Account(username, password));
        return new Response(true, "Created account.");
    }

    // Attempts to logout the user.
    Response logout(String username) throws LoginException {
        for (Account onlineUser : onlineUsers) {
            if (username.equals(onlineUser.getUsername())) {
                onlineUsers.remove(onlineUser);
                LOG.info("User has been logged out.");

                for (Account user : userList) {
                    if (username.equals(user.getUsername())) {
                        user.setStatus(Status.OFFLINE);
                        break;
                    }
                }

                return new Response(true, "User has been logged out.");
            }
        }

        LOG.warn("Error logging out user. User might not be logged on.");
        throw new LoginException("Error logging out user.");
    }

    // Adds a user to the user list. Will add users with same name, so checks need to be done before.
    void addUser(Account account) {
        userList.add(account);
    }

    List<Account> getOnlineUsers() {
        return onlineUsers;
    }

    List<Account> getUserList() {
        return userList;
    }
    
    String getCurrentUserName() {
    	return this.currentUserName;
    }
    
    void setCurrentUserName(String name) {
    	currentUserName = name;
    }
    
    Queue<Session> getSessions() {
    	return sessions;
    }
    
 // Broadcasts user list to all online users
    void broadcastUserList() {
        sessions.stream().filter(Session::isOpen).forEach(session -> {
            try {
                session.getRemote().sendString(gson.toJson(new UserListJson("userlist", userList)));
            } catch (IOException io) {
                LOG.error("Failed to send broadcast, could not send to: {}", session.getLocalAddress());
            }
        });
    }
}
