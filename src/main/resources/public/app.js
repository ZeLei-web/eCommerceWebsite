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
        .then(response => {
            if (!response.ok) {
                throw new Error("Login failed");
            }
            return response.json();
        })
        .then(data => {
            if (data.message === "Login successful") {
                localStorage.setItem("username", data.username);
                window.location.href = "homepage.html"; // 确保跳转到主页
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
    }
}
