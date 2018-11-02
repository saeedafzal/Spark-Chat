package com.ig.chat;

import com.ig.chat.model.Account;
import com.ig.chat.model.LoginException;
import com.ig.chat.model.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class Login {

    private static final Logger LOG = LoggerFactory.getLogger(Login.class);
    private List<Account> userList = new ArrayList<>();
    private List<Account> onlineUsers = new ArrayList<>();

    public Response login(Account account) throws LoginException {
        for (Account userListAccount : userList) {
            // Check if username exists.
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

    public void addUser(Account account) {
        userList.add(account);
    }

    public List<Account> getOnlineUsers() {
        return onlineUsers;
    }
}
