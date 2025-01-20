const API_BASE = "http://localhost:4567";

fetch(`${API_BASE}/orders`)
    .then(response => response.json())
    .then(orders => {
        const orderList = document.getElementById("order-list");
        orders.forEach(order => {
            const orderDiv = document.createElement("div");
            orderDiv.className = "order-item";

            // 图片部分
            const img = document.createElement("img");
            img.src = `public/products/${order.productId}.jpg`; // 假设图片路径格式
            img.alt = "Product Image";

            // 商品详情
            const detailsDiv = document.createElement("div");
            detailsDiv.className = "order-details";
            detailsDiv.innerHTML = `
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Product Name:</strong> ${order.productName}</p>
                <p><strong>Price:</strong> RM ${order.price.toFixed(2)}</p>
                <p><strong>Status:</strong> ${order.status}</p>
            `;

            // 操作按钮
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "order-actions";

            if (order.status === "Processing") {
                const cancelButton = document.createElement("button");
                cancelButton.textContent = "Cancel Order";
                cancelButton.addEventListener("click", () => {
                    updateOrderStatus(order.orderId, "Cancelled");
                });

                const continueButton = document.createElement("button");
                continueButton.textContent = "Continue Purchase";
                continueButton.addEventListener("click", () => {
                    localStorage.setItem("orderId", order.orderId);
                    window.location.href = "order.html";
                });

                actionsDiv.appendChild(cancelButton);
                actionsDiv.appendChild(continueButton);
            } else if (order.status === "Completed") {
                const refundButton = document.createElement("button");
                refundButton.textContent = "Request Refund";
                refundButton.addEventListener("click", () => {
                    updateOrderStatus(order.orderId, "Refunded");
                });
                actionsDiv.appendChild(refundButton);
            }

            // 组合各部分
            orderDiv.appendChild(img);
            orderDiv.appendChild(detailsDiv);
            orderDiv.appendChild(actionsDiv);
            orderList.appendChild(orderDiv);
        });
    })
    .catch(error => console.error("Error loading orders:", error));

function updateOrderStatus(orderId, newStatus) {
    fetch(`${API_BASE}/order/${orderId}?status=${newStatus}`, {
        method: "PUT"
    })
        .then(response => {
            if (response.ok) {
                alert(`Order ${orderId} status updated to ${newStatus}`);
                window.location.reload();
            } else {
                alert("Failed to update order status.");
            }
        })
        .catch(error => console.error("Error updating order status:", error));
}
