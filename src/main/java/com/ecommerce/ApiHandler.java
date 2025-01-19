package com.ecommerce;

import com.google.gson.Gson;

import java.util.List;

import static spark.Spark.*;

public class ApiHandler {
    public static void main(String[] args) {
        UserManager userManager = new UserManager();
        ProductManager productManager = new ProductManager();

        // 配置静态资源目录
        staticFiles.externalLocation("src/main/resources/public");

        // 配置跨域支持
        options("/*", (req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
            return "OK";
        });

        // 根路径重定向到 index.html
        get("/", (req, res) -> {
            res.redirect("/index.html");
            return null;
        });

        // 用户注册接口
        post("/register", (req, res) -> {
            String username = req.queryParams("username");
            String password = req.queryParams("password");
            if (userManager.register(username, password)) {
                return "Registration successful";
            } else {
                res.status(400);
                return "Username already exists";
            }
        });

        // 用户登录接口
        post("/login", (req, res) -> {
            String username = req.queryParams("username");
            String password = req.queryParams("password");
            if (userManager.login(username, password)) {
                res.type("application/json");
                return "{\"message\":\"Login successful\", \"username\":\"" + username + "\"}";
            } else {
                res.status(401);
                return "Invalid username or password";
            }
        });

        // 商品列表接口
        get("/products", (req, res) -> {
            res.type("application/json");
            List<Product> products = productManager.getProducts();
            Gson gson = new Gson();
            return gson.toJson(products.stream().map(product ->
                    new ProductResponse(
                            product.getId(),
                            product.getName(),
                            product.getPrice(),
                            "/products/" + product.getId() + ".jpg"
                    )
            ).toList());
        });
// 添加单个商品详情接口
        get("/products/:id", (req, res) -> {
            String idParam = req.params(":id");
            if (idParam == null || idParam.isEmpty()) {
                res.status(400);
                return "Invalid product ID";
            }

            try {
                int productId = Integer.parseInt(idParam);
                Product product = productManager.getProductById(productId);

                if (product != null) {
                    res.type("application/json");
                    return new Gson().toJson(product);
                } else {
                    res.status(404);
                    return "Product not found";
                }
            } catch (NumberFormatException e) {
                res.status(400);
                return "Invalid product ID format";
            }
        });




        System.out.println("Server running at http://localhost:4567");
    }

    // 用于 JSON 响应的内部类
    static class ProductResponse {
        private final int id;
        private final String name;
        private final double price;
        private final String imagePath;

        public ProductResponse(int id, String name, double price, String imagePath) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.imagePath = imagePath;
        }
    }
}
