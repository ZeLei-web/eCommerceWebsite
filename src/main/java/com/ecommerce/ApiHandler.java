package com.ecommerce;

import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.List;

import static spark.Spark.*;

public class ApiHandler {
    public static void main(String[] args) {
        UserManager userManager = new UserManager();
        ProductManager productManager = new ProductManager();
        CartManager cartManager = new CartManager();
        OrderManager orderManager = new OrderManager();

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
                return "{\"message\":\"Login successful\", \"userId\":\"" + username + "\", \"username\":\"" + username + "\"}";
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

        // 添加到购物车接口
        post("/cart", (req, res) -> {
            Gson gson = new Gson();
            CartItem cartItem;
            try {
                cartItem = gson.fromJson(req.body(), CartItem.class);
            } catch (Exception e) {
                res.status(400);
                return "Invalid request payload.";
            }

            if (cartItem.getId() <= 0 || cartItem.getName() == null || cartItem.getName().isEmpty()) {
                res.status(400);
                return "Invalid cart item data.";
            }

            boolean success = cartManager.addToCart(cartItem);
            if (success) {
                res.status(200);
                return "Item added to cart successfully.";
            } else {
                res.status(500);
                return "Failed to add item to cart.";
            }
        });

        // 创建订单接口
        post("/order", (req, res) -> {
            Gson gson = new Gson();
            Order order = gson.fromJson(req.body(), Order.class);

            if (order.getProductId() <= 0 || order.getStatus() == null || order.getStatus().isEmpty()) {
                res.status(400);
                return "Invalid order data.";
            }

            boolean success = orderManager.createOrder(order);
            if (success) {
                res.status(200);
                return "Order created successfully.";
            } else {
                res.status(500);
                return "Failed to create order.";
            }
        });

        put("/order/:id", (req, res) -> {
            int orderId = Integer.parseInt(req.params(":id"));
            String newStatus = req.queryParams("status");

            if (newStatus == null || newStatus.isEmpty()) {
                res.status(400);
                return "Invalid status.";
            }

            boolean success = orderManager.updateOrderStatus(orderId, newStatus);
            if (success) {
                res.status(200);
                return "Order status updated successfully.";
            } else {
                res.status(500);
                return "Failed to update order status.";
            }
        });


// 获取当前用户的订单列表接口
        get("/orders", (req, res) -> {
            String currentUserId = req.queryParams("userId");
            if (currentUserId == null || currentUserId.isEmpty()) {
                res.status(400);
                return "User ID is required.";
            }

            List<Order> orders = orderManager.getOrders();
            List<OrderWithProductDetails> userOrders = new ArrayList<>();

            for (Order order : orders) {
                if (String.valueOf(order.getUserId()).equals(currentUserId)) { // 确保类型一致
                    Product product = productManager.getProductById(order.getProductId());
                    if (product != null) {
                        userOrders.add(new OrderWithProductDetails(order, product));
                    }
                }
            }

            if (userOrders.isEmpty()) {
                res.status(404);
                return "No orders found for this user.";
            }

            res.type("application/json");
            return new Gson().toJson(userOrders);
        });
        System.out.println("Server running at http://localhost:4567");
    }
    // 包含订单与商品详情的组合类
    static class OrderWithProductDetails {
        private final int orderId;
        private final int productId;
        private final String productName;
        private final double productPrice;
        private final String productImagePath;
        private final String status;

        public OrderWithProductDetails(Order order, Product product) {
            this.orderId = order.getOrderId();
            this.productId = order.getProductId();
            this.productName = product.getName();
            this.productPrice = product.getPrice();
            this.productImagePath = "/products/" + product.getId() + ".jpg";
            this.status = order.getStatus();
        }
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
