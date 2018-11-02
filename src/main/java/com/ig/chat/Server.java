package com.ig.chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static spark.Spark.*;

public class Server {

    private static final Logger LOG = LoggerFactory.getLogger(Server.class);
    private Login login;

    private Server() {
        this.login = new Login();
    }

    private void start() {
        post("/login", (req, res) -> {
            LOG.info("Login Request Received");
            
            return "Hello World";
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
        enableCORS();
        new Server().start();
    }
}
