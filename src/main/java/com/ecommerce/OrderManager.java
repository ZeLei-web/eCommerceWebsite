package com.ecommerce;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class OrderManager {
    private static final String ORDER_FILE_PATH = "src/main/resources/orderlist.txt";
    private static int orderCounter = 1; // 订单编号计数器

    // 获取当前最大的订单编号
    private int getNextOrderId() {
        int maxOrderId = 0;
        try (BufferedReader reader = new BufferedReader(new FileReader(ORDER_FILE_PATH))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(";;;"); // 根据分隔符分割
                if (parts.length > 0) {
                    int orderId = Integer.parseInt(parts[0]);
                    maxOrderId = Math.max(maxOrderId, orderId); // 获取最大订单编号
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading orders file: " + e.getMessage());
        }
        return maxOrderId + 1; // 返回下一个订单编号
    }

    // 创建订单
    public synchronized boolean createOrder(Order order) {
        int nextOrderId = getNextOrderId();
        order.setOrderId(nextOrderId);

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(ORDER_FILE_PATH, true))) {
            writer.write(order.getOrderId() + ";;;" + order.getProductId() + ";;;" + order.getUserId() + ";;;" + order.getStatus());
            writer.newLine();
            return true;
        } catch (IOException e) {
            System.err.println("Error writing to orders file: " + e.getMessage());
            return false;
        }
    }

    // 更新订单状态
    public synchronized boolean updateOrderStatus(int orderId, String newStatus) {
        List<Order> orders = getOrders();
        boolean updated = false;

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(ORDER_FILE_PATH))) {
            for (Order order : orders) {
                if (order.getOrderId() == orderId) {
                    order.setStatus(newStatus);
                    updated = true;
                }
                writer.write(order.getOrderId() + ";;;" + order.getProductId() + ";;;" + order.getUserId() + ";;;" + order.getStatus());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("Error updating orders.txt: " + e.getMessage());
            return false;
        }

        return updated;
    }

    // 获取订单列表
    public List<Order> getOrders() {
        List<Order> orders = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(ORDER_FILE_PATH))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(";;;");
                if (parts.length == 4) {
                    int orderId = Integer.parseInt(parts[0]);
                    int productId = Integer.parseInt(parts[1]);
                    int userId = Integer.parseInt(parts[2]);
                    String status = parts[3];
                    orders.add(new Order(orderId, productId, userId, status));
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading order list: " + e.getMessage());
        }
        return orders;
    }
}
