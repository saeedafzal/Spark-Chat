package com.ig.chat;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ig.chat.model.Account;
import com.ig.chat.model.LoginException;
import com.ig.chat.model.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static spark.Spark.*;

public class Server {

    private static final Logger LOG = LoggerFactory.getLogger(Server.class);
    private Gson gson = new GsonBuilder().create();
    private final Login login;

    private Server() {
        this.login = Login.getInstance();
        login.addUser(new Account("Bob", "bob"));
        login.addUser(new Account("Jack", "jack"));
        login.addUser(new Account("Giant", "giant"));
    }

    private void start() {
        // Login
        post("/login", (req, res) -> {
            LOG.info("Server: [Received login request: {}]", req.body());
            final Account account = gson.fromJson(req.body(), Account.class);
            LOG.info("Account: {}", account);

            try {
                return gson.toJson(login.login(account));
            } catch (LoginException e) {
                LOG.error("Failed to login: {}", e.getMessage(), e);
                return gson.toJson(new Response(false, e.getMessage()));
            }
        });

        // Create Account
        post("/create", (req, res) -> {
            LOG.info("Server: Received create account request: {}", req.body());
            final Account account = gson.fromJson(req.body(), Account.class);            
            
            try {
            	return gson.toJson(login.createAccount(account.getUsername(), account.getPassword()));
            } catch (LoginException e) {
            	LOG.error("Failed to create account: {}", e.getMessage(), e);
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
