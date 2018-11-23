package com.ig.chat;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ig.chat.model.Account;
import com.ig.chat.model.AccountEntry;
import com.ig.chat.model.LoginException;
import com.ig.chat.model.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static spark.Spark.*;

public class Server {

    private static final Logger LOG = LoggerFactory.getLogger(Server.class);
    private Gson gson = new GsonBuilder().create();
    private final Login login;

    // Gets the login reference and creates dummy accounts.
    private Server() {
        this.login = Login.getInstance();
        login.addUser(new Account("Bob", "bob"));
        login.addUser(new Account("Jack", "jack"));
        login.addUser(new Account("Giant", "giant"));
    }

    // Sets the HTTP server routes.
    private void start() {
        // Login
        post("/login/:username", (req, res) -> {
            LOG.info("Server: [Received login request: {}]", req.body());
            final AccountEntry accountEntry = gson.fromJson(req.body(), AccountEntry.class);
            LOG.info("Account: {}", accountEntry);
            login.setCurrentUserName(req.params(":username"));

            try {
                return gson.toJson(login.login(accountEntry));
            } catch (LoginException e) {
                LOG.error("Failed to login: {}", e.getMessage(), e);
                return gson.toJson(new Response(false, e.getMessage()));
            }
        });

        // Create Account
        post("/create", (req, res) -> {
            LOG.info("Server: Received create account request: {}", req.body());
            final AccountEntry account = gson.fromJson(req.body(), AccountEntry.class);
            
            try {
            	return gson.toJson(login.createAccount(account.getUsername(), account.getPassword()));
            } catch (LoginException e) {
            	LOG.error("Failed to create account: {}", e.getMessage(), e);
            	return gson.toJson(new Response(false, e.getMessage()));
            }
        });

        // Logout
        post("/logout", (req, res) -> {
            LOG.info("Received logout request for: {}", req.body());

            try {
                return gson.toJson(login.logout(req.body()));
            } catch (LoginException e) {
                LOG.error("Failed to logout account: {}", e.getMessage(), e);
                return gson.toJson(new Response(false, e.getMessage()));
            }
        });
    }

    //CORS code
    private static void enableCORS() {
        options("/*", (request, response) -> {
            final String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null)
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            final String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null)
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Request-Method", "GET, POST");
            response.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin");
        });
    }

    public static void main(String[] args) {
        staticFileLocation("/public");
        webSocket("/chat", Handler.class);
        enableCORS();
        new Server().start();
    }
}
