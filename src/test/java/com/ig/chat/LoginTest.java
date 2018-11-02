package com.ig.chat;

import com.ig.chat.model.Account;
import com.ig.chat.model.LoginException;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.fail;

public class LoginTest {

    private Login login;

    @Before
    public void setup() {
        login = new Login();
        login.addUser(new Account("Bob", "bob"));
        login.addUser(new Account("Jack", "jack"));
        login.addUser(new Account("Giant", "giant"));
    }

    @Test
    public void loginSuccessTest() throws LoginException {
        assertThat(login.getOnlineUsers().size(), is(0));

        login.login(new Account("Bob", "bob"));
        assertThat(login.getOnlineUsers().size(), is(1));
    }

    @Test(expected = LoginException.class)
    public void wrongUsernameTest() throws LoginException {
        login.login(new Account("Random", "asd"));
    }

    @Test(expected = LoginException.class)
    public void correctUsernameWrongPasswordTest() throws LoginException {
        login.login(new Account("Bob", "asd"));
    }

    @Test(expected = LoginException.class)
    public void alreadyOnlineTest() throws LoginException {
        login.login(new Account("Bob", "bob"));

        // Try logging in again with same details
        login.login(new Account("Bob", "bob"));
    }
}
