package com.ig.chat;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ig.chat.model.Account;
import com.ig.chat.model.StatusResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import static spark.Spark.before;
import static spark.Spark.get;
import static spark.Spark.options;
import static spark.Spark.post;
import static spark.Spark.staticFileLocation;
import static spark.Spark.webSocket;

public class Server {
    private static final Logger LOG = LoggerFactory.getLogger(Server.class);
    private final Gson gson = new GsonBuilder().create();
    private final List<Account> onlineList = new ArrayList<>(); //list version of online users
    static final List<Account> userList = new ArrayList<>(); //list of all online users
    static Account account; //current user to be dealt with

    private void run() {
        //add some dummy accounts
        final Account a = new Account("Bob", "bob");
        final Account b = new Account("Jack", "jack");
        final Account c = new Account("Giant", "giant");
        userList.add(a);
        userList.add(b);
        userList.add(c);

        //HTTP requests
        post("/login", (req, res) -> {
            boolean online = false; //whether account is online or not
            boolean exists = false; //checks whether account exists
            final StatusResponse response = new StatusResponse(); //response to send back
            LOG.info("{}", req.body());
            account = gson.fromJson(req.body(), Account.class);
            LOG.info("{}", account);

            //check if account exists
            for (Account acc : userList) {
                if (acc.getUsername().equals(account.getUsername()) && acc.getPassword().equals(account.getPassword())) {
                    exists = true;
                    break;
                }
            }

            //check if user online
            if (exists) {
                if (!(onlineList.size() < 1)) {
                    for (Account acc : onlineList) {
                        if (acc.getUsername().equals(account.getUsername())) {
                            online = true;
                            break;
                        }
                    }
                }
            } else {
                response.setMessage("User does not exist!");
                response.setStatus(false);
                return gson.toJson(response);
            }

            if (!online) {
                response.setMessage("You have logged in!");
                response.setStatus(true);
                onlineList.add(account);
                return gson.toJson(response);
            } else {
                response.setMessage("User already online!");
                response.setStatus(false);
                return gson.toJson(response);
            }
        });

        get("/test", (req, res) -> {
            LOG.info("Testing...");
            return "Works";
        });

        post("/logout", (req, res) -> {
            final StatusResponse response = new StatusResponse();
            //check if user is already offline
            response.setStatus(true);
            response.setMessage("You have logged out!");

            for (int i = 0; i < onlineList.size(); i++) {
                if (onlineList.get(i).getUsername().equals(req.body())) {
                    onlineList.remove(i);
                    break;
                }
            }

            LOG.info("{} has logged out!", req.body());

            return gson.toJson(response);
        });

        post("/createAccount", (req, res) -> {
            final StatusResponse response = new StatusResponse();
            final Account account = gson.fromJson(req.body(), Account.class);
            boolean taken = false;

            for (Account ac : userList) {
                if (ac.getUsername().equals(account.getUsername())) {
                    response.setMessage("User already exists!");
                    response.setStatus(false);
                    LOG.warn("Error! User already exists, cannot create account.");
                    taken = true;
                    break;
                }
            }

            if (!taken) {
                userList.add(account);
                response.setMessage("Created Account");
                response.setStatus(true);
            }

            return gson.toJson(response);
        });
    }

    //CORS code
    private static void enableCORS() {
        options("/*", (request, response) -> {
            final String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            final String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
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
        new Server().run();
    }
}
