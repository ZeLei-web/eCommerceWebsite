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
                        .catch(error => {
                            console.error("Error adding item to cart:", error);
                            alert("Failed to add item to cart. Please try again.");
                        });
                });

                // "Buy Now" 按钮功能
                document.getElementById("buy-now").addEventListener("click", () => {
                    localStorage.setItem("buyNowItem", JSON.stringify(product));
                    window.location.href = "order.html";
                });
    })
    .catch(error => console.error("Error loading product details:", error));

// 加载商品图片
function loadProductImages(productId) {
    let index = 0;
    const maxImages = 10; // 假设最多有10张图片

    function loadNextImage() {
        const imagePath = `products/${productId}${index === 0 ? "" : `-${index}`}.jpg`;
        const img = new Image();
        img.src = imagePath;

        img.onload = () => {
            images.push(imagePath); // 加载成功的图片路径
            addThumbnail(imagePath, index); // 添加缩略图
            if (index === 0) {
                updateImage(); // 显示原图
            }
            index++;
            if (index < maxImages) {
                loadNextImage(); // 继续加载下一张图片
            }
        };

        img.onerror = () => {
            console.warn(`Image not found: ${imagePath}`);
            // 如果找不到图片，停止加载后续图片
            if (index === 0) {
                const defaultImage = "products/default.jpg"; // 使用默认图片
                productImage.src = defaultImage;
            }
        };
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
        updateImage(); // 更新主图
    });
    thumbnailContainer.appendChild(thumbnail);
}

// 更新主图
function updateImage() {
    if (images.length > 0) {
        productImage.src = images[currentImageIndex]; // 更新主图路径
    } else {
        const defaultImage = "products/default.jpg"; // 使用默认图片
        productImage.src = defaultImage;
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

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("add-to-cart").addEventListener("click", () => {
        fetch(`${API_BASE}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: productId,
                name: document.getElementById("product-name").textContent,
                price: parseFloat(document.getElementById("product-price").textContent.replace("RM ", ""))
            })
        })
        .then(response => {
            if (response.ok) {
                alert("Item added to cart successfully!");
            } else {
                alert("Failed to add item to cart.");
            }
        })
        .catch(error => console.error("Error adding item to cart:", error));
    });

    document.getElementById("buy-now").addEventListener("click", () => {
        fetch(`${API_BASE}/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId: productId,
                status: "Processing"
            })
        })
        .then(response => {
            if (response.ok) {
                alert("Order created successfully!");
                window.location.href = "orderlist.html";
            } else {
                alert("Failed to create order.");
            }
        })
        .catch(error => console.error("Error creating order:", error));
    });


});
