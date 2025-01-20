const API_BASE = "http://localhost:4567";
const currentUserId = localStorage.getItem("userId"); // 获取当前用户ID

if (!currentUserId) {
    alert("Please log in to view your cart.");
    window.location.href = "index.html"; // 跳转到登录页面
}

// 获取购物车信息
fetch(`${API_BASE}/cart?userId=${currentUserId}`)
    .then(response => response.json())
    .then(cartItems => {
        const container = document.getElementById("cart-container");

        if (cartItems.length === 0) {
            container.innerHTML = "<p>Your cart is empty.</p>";
            return;
        }

        cartItems.forEach(item => {
            fetch(`${API_BASE}/products/${item.productId}`)
                .then(response => response.json())
                .then(product => {
                    const cartItemDiv = document.createElement("div");
                    cartItemDiv.classList.add("cart-item");

                    cartItemDiv.innerHTML = `
                        <div class="cart-item-image">
                            <img src="${API_BASE}/products/${item.productId}.jpg" alt="${product.name}" width="150" height="150" />
                        </div>
                        <div class="cart-item-info">
                            <h3>${product.name}</h3>
                            <p>Price: RM ${product.price.toFixed(2)}</p>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Total: RM ${(product.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div class="cart-item-actions">
                            <button class="remove-btn" data-product-id="${item.productId}">Remove</button>
                            <button class="update-btn" data-product-id="${item.productId}">Update Quantity</button>
                        </div>
                    `;

                    container.appendChild(cartItemDiv);

                    // 删除按钮事件
                    cartItemDiv.querySelector(".remove-btn").addEventListener("click", () => {
                        const productId = item.productId;
                        removeFromCart(productId); // 删除指定商品
                    });


                    // 更新数量按钮事件
                    cartItemDiv.querySelector(".update-btn").addEventListener("click", () => {
                        const newQuantity = prompt("Enter new quantity:", item.quantity);
                        if (newQuantity && !isNaN(newQuantity) && newQuantity > 0) {
                            updateCartItem(item.productId, newQuantity);
                        }
                    });
                });
        });
    })
    .catch(error => {
        console.error("Error loading cart items:", error);
        document.getElementById("cart-container").innerHTML = "<p>Failed to load cart items.</p>";
    });

// 从购物车删除商品
function removeFromCart(productId) {
    const currentUserId = localStorage.getItem("userId"); // 获取当前用户ID
    if (!currentUserId) {
        alert("Please log in to remove items from your cart.");
        window.location.href = "index.html"; // 跳转到登录页面
        return;
    }

    // 发送删除请求
    fetch(`${API_BASE}/cart/${productId}?userId=${currentUserId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (response.ok) {
            alert("Item removed from cart.");
            window.location.reload();
        } else {
            alert("Failed to remove item from cart.");
        }
    })
    .catch(error => {
        console.error("Error removing item from cart:", error);
        alert("Failed to remove item from cart.");
    });
}


// 更新购物车中商品数量
function updateCartItem(productId, quantity) {
    fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            productId: productId,
            userId: currentUserId,
            quantity: quantity
        })
    })
    .then(response => {
        if (response.ok) {
            alert("Cart updated successfully.");
            window.location.reload();
        } else {
            alert("Failed to update cart.");
        }
    })
    .catch(error => {
        console.error("Error updating cart:", error);
        alert("Failed to update cart.");
    });
}
