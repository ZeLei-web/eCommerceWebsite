const API_BASE = "http://localhost:4567";

// 注册
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
    .then(response => {
        if (!response.ok) {
            throw new Error("Login failed");
        }
        return response.json();
    })
    .then(data => {
        if (data.message === "Login successful") {
            localStorage.setItem("username", data.username);
            window.location.href = "homepage.html"; // 确保路径正确
        } else {
            alert("Invalid username or password");
        }
    })
    .catch(error => {
        console.error("Error during login:", error);
        alert("Login failed: Unable to connect to the server.");
    });
});

// 主页加载用户名和商品列表
if (window.location.pathname.includes("homepage.html")) {
    const username = localStorage.getItem("username") || "Guest";
    const userInfo = document.getElementById("user-info");
    userInfo.textContent = username;

    userInfo.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("username");
            window.location.href = "index.html";
        }
    });

    fetch(`${API_BASE}/products`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            return response.json();
        })
        .then(products => {
            const productContainer = document.getElementById("product-list");
            productContainer.innerHTML = "";
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
        })
        .catch(error => {
            console.error("Error loading products:", error);
            alert("Failed to load products. Please try again later.");
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
