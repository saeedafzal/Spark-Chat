package com.ig.chat;

import com.ig.chat.model.Account;
import com.ig.chat.model.LoginException;
import com.ig.chat.model.Response;
import com.ig.chat.model.Status;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

class Login {

    private static final Logger LOG = LoggerFactory.getLogger(Login.class);
    private static Login login_instance = null;
    private List<Account> onlineUsers = new ArrayList<>();
    private List<Account> userList = new ArrayList<>();

    static Login getInstance() {
        if (login_instance == null) login_instance = new Login();
        return login_instance;
    }

    /**
     * Attempts to log in the specified user and fails if it cannot login.
     */
    Response login(Account account) throws LoginException {
        // Check if username exists.
        for (Account userListAccount : userList) {
            if (account.getUsername().equals(userListAccount.getUsername())) {
                LOG.info("User exists.");
                // Check if user is not online
                for (Account onlineUserAccount : onlineUsers) {
                    if (account.getUsername().equals(onlineUserAccount.getUsername())) {
                        // User is already online
                        LOG.warn("User is already online.");
                        throw new LoginException("User is already online!");
                    }
                }

                // Check if password matches
                if (account.getPassword().equals(userListAccount.getPassword())) {
                    LOG.info("User logged in.");
                    account.setStatus(Status.OFFLINE);
                    onlineUsers.add(account);
                    return new Response(true, "User logged in.");
                } else {
                    LOG.warn("Incorrect password.");
                    throw new LoginException("Incorrect Password!");
                }
            }
        }

        LOG.warn("User does not exist!");
        throw new LoginException("User does not exist.");
    }

    /**
     * Attempts to create a new account and fails if it cannot create.
     */
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

    /**
     * Adds a user to the user list. Will add users with same name, so checks need to be done before.
     * @param account The account to be added.
     */
    void addUser(Account account) {
        userList.add(account);
    }

    List<Account> getOnlineUsers() {
        return onlineUsers;
    }

    List<Account> getUserList() {
        return userList;
    }
}
