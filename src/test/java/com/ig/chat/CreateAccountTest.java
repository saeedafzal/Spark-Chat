package com.ig.chat;

import com.ig.chat.model.Account;
import com.ig.chat.model.LoginException;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.CoreMatchers.is;

public class CreateAccountTest {

    private Login login;

    @Before
    public void test() {
        login = new Login();
        login.addUser(new Account("Bob", "bob"));
        login.addUser(new Account("Jack", "jack"));
        login.addUser(new Account("Giant", "giant"));
    }

    @Test
    public void createNewAccountTest() throws LoginException {
        int numberOfUsers = login.getUserList().size();
        assertThat(login.getUserList().size(), is(numberOfUsers));

        login.createAccount("Saeed", "Pass");
        assertThat(login.getUserList().size(), is(numberOfUsers + 1));
    }

    @Test(expected = LoginException.class)
    public void accountWithExistingName() throws LoginException {
    	login.createAccount("Bob", "bob");
    }

    @Test
    public void loggingInWithCreatedAccountTest() throws LoginException {
    	assertThat(login.getOnlineUsers().size(), is(0));
    	
    	Account account = new Account("Saeed", "Pass");
    	login.createAccount(account.getUsername(), account.getPassword());
    	login.login(account);
    	assertThat(login.getOnlineUsers().size(), is(1));
    }
}
