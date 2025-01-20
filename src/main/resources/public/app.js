const API_BASE = "http://localhost:4567";

// 注册逻辑
document.getElementById("register-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;

    fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${username}&password=${password}`
    })
        .then(response => {
            if (response.ok) {
                alert("Registration successful!");
            } else {
                alert("Registration failed: Username already exists.");
            }
        })
        .catch(error => {
            console.error("Error during registration:", error);
            alert("Registration failed: Unable to connect to the server.");
        });
});

// 登录逻辑
document.getElementById("login-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Login successful") {
                // 将 username 存储为 userId
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("username", data.username);
                window.location.href = "homepage.html"; // 跳转到主页
            } else {
                alert("Invalid username or password");
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
            alert("Login failed: Unable to connect to the server.");
        });
});


// 搜索功能
document.getElementById("search-btn")?.addEventListener("click", function () {
    const searchTerm = document.getElementById("search-input").value.toLowerCase();
    console.log("Searching for:", searchTerm);

    fetch(`${API_BASE}/products`)
        .then(response => response.json())
        .then(products => {
            const filteredProducts = searchTerm
                ? products.filter(product => {
                      const name = product.name ? product.name.toLowerCase() : "";
                      const description = product.description ? product.description.toLowerCase() : "";
                      return name.includes(searchTerm) || description.includes(searchTerm);
                  })
                : products; // 如果搜索为空，显示所有商品
            displayProducts(filteredProducts);
        })
        .catch(error => {
            console.error("Error loading products:", error);
            alert("Failed to load products. Please try again later.");
        });
});

// 显示商品的函数
function displayProducts(products) {
    const productContainer = document.getElementById("product-list");
    if (!productContainer) {
        console.error("Error: #product-list not found in the current page.");
        return;
    }

    productContainer.innerHTML = ""; // 清空现有商品
    products.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.className = "product";
        productDiv.innerHTML = `
            <img src="products/${product.id}.jpg" alt="${product.name}" />
            <h3 title="${product.name}">${truncateText(product.name, 2)}</h3>
            <p>RM ${product.price.toFixed(2)}</p>
        `;
        productDiv.addEventListener("click", () => {
            window.location.href = `product.html?id=${product.id}`;
        });
        productContainer.appendChild(productDiv);
    });
}

// 工具函数：截断文本为指定行数
function truncateText(text, maxLines) {
    const maxLength = 20; // 每行最大字符数
    const maxCharacters = maxLength * maxLines; // 总最大字符数
    if (text.length > maxCharacters) {
        return text.slice(0, maxCharacters - 3) + "...";
    }
    return text;
}

// 默认加载所有商品
if (document.getElementById("product-list")) {
    fetch(`${API_BASE}/products`)
        .then(response => {
            if (!response.ok) {
                console.error("Failed to load products:", response.statusText);
                throw new Error("Failed to load products");
            }
            return response.json();
        })
        .then(products => {
            console.log("Products loaded:", products);
            displayProducts(products);
        })
        .catch(error => {
            console.error("Error loading products:", error);
            alert("Failed to load products. Please try again later.");
        });
}

// 加载主页用户名
if (window.location.pathname.includes("homepage.html")) {
    const username = localStorage.getItem("username") || "Guest";
    const userInfo = document.getElementById("user-info");
    if (userInfo) {
        userInfo.textContent = username;

        // 添加点击事件监听器
        if (username !== "Guest") {
                userInfo.addEventListener("click", () => {
                    const confirmLogout = confirm("Are you sure you want to log out?");
                    if (confirmLogout) {
                        localStorage.removeItem("username");
                        window.location.href = "index.html";
                    }
                });
         }
    }
}


// 解析 URL 参数获取 productId
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
// 加载商品详情
if (window.location.pathname.includes("product.html")) {
    if (!productId) {
        alert("Invalid product URL. Redirecting to homepage.");
        window.location.href = "homepage.html";
    } else {
        // 商品详情页的相关逻辑
        fetch(`${API_BASE}/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                document.getElementById("product-name").textContent = product.name;
                document.getElementById("product-price").textContent = `RM ${product.price.toFixed(2)}`;
                document.getElementById("product-description").textContent = product.description;

                loadProductImages(productId);

                // "Add to Cart" 按钮功能
                document.getElementById("add-to-cart").addEventListener("click", () => {
                    fetch(`${API_BASE}/cart`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: product.id,
                            name: product.name,
                            price: product.price
                        })
                    })
                        .then(response => {
                            if (response.ok) {
                                alert("Item added to cart successfully!");
                            } else {
                                alert("Failed to add item to cart.");
                            }
                        })
                        .catch(error => {
                            console.error("Error adding item to cart:", error);
                            alert(`Failed to add item to cart. Error: ${error.message}`);
                        });
                });

                // "Buy Now" 按钮功能
                document.getElementById("buy-now").addEventListener("click", () => {
                    // 将商品信息存储到 localStorage，供支付页面使用
                    localStorage.setItem("buyNowItem", JSON.stringify(product));
                    window.location.href = "order.html"; // 跳转到支付页面
                });
            })
            .catch(error => console.error("Error loading product details:", error));
    }
} else {
    console.log("This page does not require productId.");
}

