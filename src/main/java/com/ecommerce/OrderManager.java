package com.ecommerce;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class OrderManager {
    private static final String ORDER_FILE_PATH = "src/main/resources/orders.txt";
    private static int orderCounter = 1; // 订单编号计数器

    // 创建订单
    public synchronized boolean createOrder(Order order) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(ORDER_FILE_PATH, true))) {
            order.setOrderId(orderCounter++); // 设置订单编号
            writer.write(order.getOrderId() + ";;;" + order.getProductId() + ";;;" + order.getStatus());
            writer.newLine();
            return true;
        } catch (IOException e) {
            System.err.println("Error writing to orders.txt: " + e.getMessage());
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
                writer.write(order.getOrderId() + ";;;" + order.getProductId() + ";;;" + order.getStatus());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("Error updating orders.txt: " + e.getMessage());
            return false;
        }

        return updated;
    }

    // 获取所有订单
    public synchronized List<Order> getOrders() {
        List<Order> orders = new ArrayList<>();
        File file = new File(ORDER_FILE_PATH);

        if (!file.exists()) {
            return orders; // 文件不存在时返回空列表
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(";;;");
                if (parts.length == 3) {
                    int orderId = Integer.parseInt(parts[0]);
                    int productId = Integer.parseInt(parts[1]);
                    String status = parts[2];
                    orders.add(new Order(orderId, productId, status));
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading orders.txt: " + e.getMessage());
        }

        return orders;
    }
}
