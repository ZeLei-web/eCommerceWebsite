const API_BASE = "http://localhost:4567";
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

let currentImageIndex = 0;
let images = [];
const productImage = document.getElementById("product-image");
const thumbnailContainer = document.getElementById("thumbnail-container");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");

// 加载商品详情
fetch(`${API_BASE}/products/${productId}`)
    .then(response => response.json())
    .then(product => {
        document.getElementById("product-name").textContent = product.name;
        document.getElementById("product-price").textContent = `RM ${product.price.toFixed(2)}`;
        document.getElementById("product-description").textContent = product.description;

        loadProductImages(productId);

        // "Add to Cart" 按钮功能
        document.getElementById("add-to-cart").addEventListener("click", () => {
            addToCart(product);
        });

        // "Buy Now" 按钮功能
        document.getElementById("buy-now").addEventListener("click", () => {
            createOrder(product); // Pass the entire product object
        });
    })
    .catch(error => console.error("Error loading product details:", error));

// 加载商品图片
function loadProductImages(productId) {
    let index = 0;
    const maxImages = 10;

    function loadNextImage() {
        const imagePath = `products/${productId}${index === 0 ? "" : `-${index}`}.jpg`;

        fetch(imagePath, { method: "HEAD" }) // 使用 HEAD 请求检查图片是否存在
            .then(response => {
                if (response.ok) {
                    const img = new Image();
                    img.src = imagePath;

                    img.onload = () => {
                        images.push(imagePath); // 加载成功的图片路径
                        addThumbnail(imagePath, index); // 添加缩略图
                        if (index === 0) {
                            updateImage(); // 显示第一张图片
                        }
                        index++;
                        if (index < maxImages) {
                            loadNextImage(); // 加载下一张图片
                        }
                    };
                } else {
                    console.warn(`Image not found: ${imagePath}`);
                }
            })
            .catch(error => {
                console.warn(`Error checking image: ${imagePath}`, error);
            });
    }

    loadNextImage(); // 开始加载图片
}

// 添加缩略图
function addThumbnail(imagePath, index) {
    const thumbnail = document.createElement("img");
    thumbnail.src = imagePath;
    thumbnail.classList.add("thumbnail");
    thumbnail.addEventListener("click", () => {
        currentImageIndex = index;
        updateImage();
    });
    thumbnailContainer.appendChild(thumbnail);
}

// 更新主图
function updateImage() {
    if (images.length > 0) {
        productImage.src = images[currentImageIndex];
    } else {
        productImage.src = "products/default.jpg";
    }
}

// 导航按钮
prevButton.addEventListener("click", () => {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateImage();
    }
});

nextButton.addEventListener("click", () => {
    if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        updateImage();
    }
});

// 添加到购物车
function addToCart(product) {
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
                response.text().then(msg => alert(`Failed to add item to cart: ${msg}`));
            }
        })
        .catch(error => console.error("Error adding item to cart:", error));
}

// 创建订单
function createOrder(product) {
    const currentUserId = localStorage.getItem("userId"); // 获取当前登录用户的ID
    if (!currentUserId) {
        alert("Please log in to complete the purchase.");
        window.location.href = "index.html"; // 跳转到登录页面
        return;
    }

    const order = {
        productId: product.id,
        userId: currentUserId,  // 当前登录用户的ID
        status: "Processing"
    };

    // 创建订单
    fetch(`${API_BASE}/order`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
    })
    .then(response => {
        if (response.ok) {
            alert("Order placed successfully!");
            window.location.href = "orderlist.html";  // 跳转到订单列表
        } else {
            alert("Failed to place the order.");
        }
    })
    .catch(error => {
        console.error("Error creating order:", error);
        alert("Failed to place the order. Please try again.");
    });
}
