package com.ecommerce;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class ProductManager {
    private static final String FILE_PATH = "src/main/resources/product.txt";

    public List<Product> getProducts() throws IOException {
        List<Product> products = new ArrayList<>();
        File file = new File(FILE_PATH);
        if (!file.exists()) {
            System.err.println("File not found: " + FILE_PATH);
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
    public Product getProductById(int id) {
        try {
            return getProducts().stream()
                    .filter(product -> product.getId() == id)
                    .findFirst()
                    .orElse(null);
        } catch (IOException e) {
            System.err.println("Error fetching product by ID: " + e.getMessage());
            return null;
        }
    }



}
