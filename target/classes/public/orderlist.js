const API_BASE = "http://localhost:4567";
const currentUserId = localStorage.getItem("userId"); // 获取用户名作为 userId

// 检查用户是否登录
if (!currentUserId) {
    alert("Please log in to view your orders.");
    window.location.href = "index.html";
}

// 获取订单
fetch(`${API_BASE}/orders?userId=${currentUserId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }
        return response.json();
    })
    .then(orders => {
        const container = document.getElementById("orders-container");

        if (orders.length === 0) {
            container.innerHTML = "<p>No orders found for this user.</p>";
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement("div");
            orderDiv.classList.add("order-item");

            const imageElement = document.createElement("img");
            imageElement.src = `${API_BASE}${order.productImagePath}`;
            imageElement.alt = order.productName;
            imageElement.style.width = "150px"; // 设置图片宽度
            imageElement.style.height = "150px"; // 设置图片高度
            imageElement.style.objectFit = "cover"; // 确保图片裁剪适配

            const orderImageDiv = document.createElement("div");
            orderImageDiv.classList.add("order-image");
            orderImageDiv.appendChild(imageElement);

            const orderInfoDiv = document.createElement("div");
            orderInfoDiv.classList.add("order-info");
            orderInfoDiv.innerHTML = `
                <h3>${order.productName}</h3>
                <p>Price: RM ${order.productPrice.toFixed(2)}</p>
                <p>Status: ${order.status}</p>
            `;

            const orderActionsDiv = document.createElement("div");
            orderActionsDiv.classList.add("order-actions");
            if (order.status === "Processing") {
                const continueBtn = document.createElement("button");
                continueBtn.classList.add("continue-btn");
                continueBtn.textContent = "Continue Purchase";
                continueBtn.setAttribute("data-order-id", order.orderId);
                continueBtn.addEventListener("click", (event) => {
                    event.preventDefault(); // 阻止默认行为
                    const confirmPurchase = confirm("Are you sure you want to complete the purchase?");
                    if (confirmPurchase) {
                        updateOrderStatus(order.orderId, "Completed");
                    }
                });

                const cancelBtn = document.createElement("button");
                cancelBtn.classList.add("cancel-btn");
                cancelBtn.textContent = "Cancel Order";
                cancelBtn.setAttribute("data-order-id", order.orderId);
                cancelBtn.addEventListener("click", (event) => {
                    event.preventDefault(); // 阻止默认行为
                    const confirmCancel = confirm("Are you sure you want to cancel the order?");
                    if (confirmCancel) {
                        updateOrderStatus(order.orderId, "Cancelled");
                    }
                });

                orderActionsDiv.appendChild(continueBtn);
                orderActionsDiv.appendChild(cancelBtn);
            }

            orderDiv.appendChild(orderImageDiv);
            orderDiv.appendChild(orderInfoDiv);
            orderDiv.appendChild(orderActionsDiv);

            container.appendChild(orderDiv);
        });
    })
    .catch(error => {
        console.error("Error loading orders:", error);
        document.getElementById("orders-container").innerHTML = "<p>Failed to load orders.</p>";
    });

// 更新订单状态
function updateOrderStatus(orderId, newStatus) {
    fetch(`${API_BASE}/order/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `status=${newStatus}`
    })
        .then(response => {
            if (response.ok) {
                alert(`Order status updated to ${newStatus}.`);
                window.location.reload(); // 刷新页面以显示更新后的状态
            } else {
                alert("Failed to update order status.");
            }
        })
        .catch(error => {
            console.error("Error updating order status:", error);
        });
}
