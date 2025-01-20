package com.ecommerce;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

public class CartManager {
    private static final String CART_FILE_PATH = "src/main/resources/cart.txt";

    public synchronized boolean addToCart(CartItem item) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(CART_FILE_PATH, true))) {
            writer.write(item.getId() + ";;;" + item.getName() + ";;;" + item.getPrice());
            writer.newLine();
            return true;
        } catch (IOException e) {
            System.err.println("Error writing to cart.txt: " + e.getMessage());
            return false;
        }
    }
}
