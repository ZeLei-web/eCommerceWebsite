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
//        staticFiles.externalLocation("/app/public");

        // 配置跨域支持
        options("/*", (req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
            CartItem cartItem = gson.fromJson(req.body(), CartItem.class);  // 获取前端传来的购物车项

            // 检查该商品是否已经在购物车中
            boolean itemExists = cartManager.checkIfItemExists(cartItem.getUserId(), cartItem.getProductId());

            if (itemExists) {
                // 如果商品已经存在，则更新数量
                cartManager.updateCartItemQuantity(cartItem.getUserId(), cartItem.getProductId(), cartItem.getQuantity());
                res.status(200);
                return "Item quantity updated in cart.";
            } else {
                // 否则，添加新商品到购物车
                cartManager.addToCart(cartItem);
                res.status(201);
                return "Item added to cart successfully.";
            }
        });

// 获取用户购物车项
        get("/cart", (req, res) -> {
            String userId = req.queryParams("userId");
            if (userId == null || userId.isEmpty()) {
                res.status(400);
                return "User ID is required.";
            }

            List<CartItem> cartItems = cartManager.getCartItemsForUser(userId);
            res.type("application/json");
            return new Gson().toJson(cartItems);
        });


// 添加或更新购物车项
        post("/cart", (req, res) -> {
            Gson gson = new Gson();
            CartItem cartItem = gson.fromJson(req.body(), CartItem.class);  // 获取前端传来的购物车项

            // 检查该商品是否已经在购物车中
            boolean itemExists = cartManager.checkIfItemExists(cartItem.getUserId(), cartItem.getProductId());

            if (itemExists) {
                // 如果商品已经存在，则更新数量
                cartManager.updateCartItemQuantity(cartItem.getUserId(), cartItem.getProductId(), cartItem.getQuantity());
                res.status(200);
                return "Item quantity updated in cart.";
            } else {
                // 否则，添加新商品到购物车
                cartManager.addToCart(cartItem);
                res.status(201);
                return "Item added to cart successfully.";
            }
        });
        // 从购物车删除商品
        delete("/cart/:productId", (req, res) -> {
            String productId = req.params(":productId");
            String userId = req.queryParams("userId");  // 确保你也传递了 userId
            if (productId != null && userId != null) {
                boolean success = cartManager.removeFromCart(userId, Integer.parseInt(productId));
                if (success) {
                    res.status(200);
                    return "Item removed from cart.";
                } else {
                    res.status(500);
                    return "Failed to remove item from cart.";
                }
            } else {
                res.status(400);
                return "Product ID and User ID are required.";
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
