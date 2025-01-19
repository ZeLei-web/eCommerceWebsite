package com.ecommerce;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class UserManager {
    private static final String FILE_PATH = "src/main/resources/users.txt";

    // 注册用户
    public synchronized boolean register(String username, String password) throws IOException {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            System.out.println("Username and password cannot be empty!");
            return false;
        }

        List<User> users = loadUsers();
        for (User user : users) {
            if (user.getUsername().equals(username)) {
                return false; // 用户名已存在
            }
        }
        users.add(new User(username, password));
        saveUsers(users);
        return true;
    }

    // 用户登录
    public synchronized boolean login(String username, String password) throws IOException {
        List<User> users = loadUsers();
        for (User user : users) {
            if (user.getUsername().equals(username) && user.getPassword().equals(password)) {
                return true; // 登录成功
            }
        }
        return false; // 登录失败
    }

    // 从文件加载用户
    private synchronized List<User> loadUsers() throws IOException {
        List<User> users = new ArrayList<>();
        File file = new File(FILE_PATH);
        if (!file.exists()) {
            file.createNewFile();
        }
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                users.add(User.fromString(line));
            }
        }
        return users;
    }

    // 保存用户到文件
    private synchronized void saveUsers(List<User> users) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(FILE_PATH))) {
            for (User user : users) {
                writer.write(user.toString());
                writer.newLine();
            }
        }
    }
}
