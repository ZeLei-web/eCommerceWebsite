package com.ecommerce;

public class Order {
    private int orderId;      // 订单编号
    private int productId;    // 商品编号
    private int userId;       // 用户编号
    private String status;    // 订单状态（例如 "Processing", "Completed" 等）

    // 构造函数
    public Order(int orderId, int productId, int userId, String status) {
        this.orderId = orderId;
        this.productId = productId;
        this.userId = userId;
        this.status = status;
    }

    // 默认构造函数（无参）
    public Order() {}

    // Getter 和 Setter 方法
    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // toString 方法，方便打印订单信息
    @Override
    public String toString() {
        return "Order{" +
                "orderId=" + orderId +
                ", productId=" + productId +
                ", userId=" + userId +
                ", status='" + status + '\'' +
                '}';
    }
}