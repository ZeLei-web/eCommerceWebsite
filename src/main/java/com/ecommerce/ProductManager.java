package com.ecommerce;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class ProductManager {
    private static final String PRODUCT_FILE_PATH = "src/main/resources/product.txt";

    public List<Product> getProducts() throws IOException {
        List<Product> products = new ArrayList<>();
        File file = new File(PRODUCT_FILE_PATH);
        if (!file.exists()) {
            System.err.println("File not found: " + PRODUCT_FILE_PATH);
            return products;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                StringBuilder descriptionBuilder = new StringBuilder();
                String[] parts = line.split(";;;");
                if (parts.length >= 4) {
                    int id = Integer.parseInt(parts[0]);
                    String name = parts[1];
                    double price = Double.parseDouble(parts[2]);

                    // 拼接多行描述
                    descriptionBuilder.append(parts[3]);
                    while (!line.endsWith("\"")) { // 检测描述是否结束（引号结束）
                        line = reader.readLine();
                        if (line == null) break;
                        descriptionBuilder.append("\n").append(line);
                    }

                    // 去掉首尾引号
                    String description = descriptionBuilder.toString().replaceAll("^\"|\"$", "");

                    // 创建商品对象并添加到列表
                    products.add(new Product(id, name, price, description));
                }
            }
        } catch (Exception e) {
            System.err.println("Error reading product.txt: " + e.getMessage());
        }

        return products;
    }

    public String getProductsAsJson() throws IOException {
        List<Product> products = getProducts();
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            json.append("{")
                    .append("\"id\":").append(product.getId()).append(",")
                    .append("\"name\":\"").append(product.getName()).append("\",")
                    .append("\"price\":").append(product.getPrice()).append(",")
                    .append("\"description\":\"").append(product.getDescription()).append("\"")
                    .append("}");
            if (i < products.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");
        return json.toString();
    }

    // 根据商品 ID 获取商品详情
    public Product getProductById(int productId) {
        try (BufferedReader reader = new BufferedReader(new FileReader(PRODUCT_FILE_PATH))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(";;;", 4); // 确保只分割前三部分，第四部分为 description
                if (parts.length >= 3) {
                    int id = Integer.parseInt(parts[0]);
                    if (id == productId) {
                        String name = parts[1];
                        double price = Double.parseDouble(parts[2]);

                        // 如果 description 以双引号开头，处理多行描述
                        StringBuilder descriptionBuilder = new StringBuilder();
                        if (parts[3].startsWith("\"")) {
                            descriptionBuilder.append(parts[3].substring(1)); // 去掉开头的双引号
                            while ((line = reader.readLine()) != null) {
                                if (line.endsWith("\"")) { // 检测结尾双引号
                                    descriptionBuilder.append("\n").append(line.substring(0, line.length() - 1));
                                    break;
                                } else {
                                    descriptionBuilder.append("\n").append(line);
                                }
                            }
                        } else {
                            descriptionBuilder.append(parts[3]); // 单行描述直接使用
                        }

                        return new Product(id, name, price, descriptionBuilder.toString());
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading product list: " + e.getMessage());
        }
        return null;
    }



}
