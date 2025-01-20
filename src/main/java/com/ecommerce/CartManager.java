package com.ecommerce;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class CartManager {
    private static final String CART_FILE_PATH = "src/main/resources/cart.txt"; // 购物车数据文件路径

    // 获取指定用户的购物车项
    public List<CartItem> getCartItemsForUser(String userId) {
        List<CartItem> cartItems = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(CART_FILE_PATH))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(";;;");

                if (parts.length == 3 && parts[1].equals(userId)) {
                    int productId = Integer.parseInt(parts[0]);
                    int quantity = Integer.parseInt(parts[2]);
                    cartItems.add(new CartItem(productId, userId, quantity));
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading cart items: " + e.getMessage());
        }
        return cartItems;
    }

    // 检查该用户是否已经有这个商品
    public boolean checkIfItemExists(String userId, int productId) {
        List<CartItem> cartItems = getCartItemsForUser(userId);
        return cartItems.stream().anyMatch(item -> item.getProductId() == productId);
    }

    // 更新购物车中商品的数量
    public void updateCartItemQuantity(String userId, int productId, int quantity) {
        List<CartItem> cartItems = getCartItemsForUser(userId);
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(CART_FILE_PATH))) {
            for (CartItem item : cartItems) {
                if (item.getProductId() == productId) {
                    item.setQuantity(quantity); // 更新数量
                }
                writer.write(item.getProductId() + ";;;" + item.getUserId() + ";;;" + item.getQuantity());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("Error updating cart item: " + e.getMessage());
        }
    }

    // 添加商品到购物车
    public void addToCart(CartItem cartItem) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(CART_FILE_PATH, true))) {
            writer.write(cartItem.getProductId() + ";;;" + cartItem.getUserId() + ";;;" + cartItem.getQuantity());
            writer.newLine();
        } catch (IOException e) {
            System.err.println("Error adding item to cart: " + e.getMessage());
        }
    }
    // 从购物车中删除商品
    public boolean removeFromCart(String userId, int productId) {
        List<CartItem> cartItems = getCartItemsForUser(userId);
        boolean itemRemoved = false;

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(CART_FILE_PATH))) {
            for (CartItem item : cartItems) {
                if (item.getProductId() == productId) {
                    itemRemoved = true;  // 找到并删除该商品
                } else {
                    writer.write(item.getProductId() + ";;;" + item.getUserId() + ";;;" + item.getQuantity());
                    writer.newLine();
                }
            }
        } catch (IOException e) {
            System.err.println("Error removing item from cart: " + e.getMessage());
        }

        return itemRemoved;
    }


}
