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
    const currentUserId = localStorage.getItem("userId"); // 获取当前用户ID
    if (!currentUserId) {
        alert("Please log in to add items to your cart.");
        window.location.href = "index.html"; // 跳转到登录页面
        return;
    }

    // 弹出确认框，询问用户是否添加到购物车
    const confirmAdd = confirm(`Do you want to add ${product.name} to your cart?`);
    if (confirmAdd) {
        // 检查该商品是否已在购物车中
        fetch(`${API_BASE}/cart?userId=${currentUserId}`)
            .then(response => response.json())
            .then(cartItems => {
                const existingItem = cartItems.find(item => item.productId === product.id);
                if (existingItem) {
                    // 如果商品已经存在，则更新数量
                    existingItem.quantity += 1;
                    updateCartItem(existingItem); // 更新购物车项
                } else {
                    // 如果商品不存在，则添加新商品
                    addNewItemToCart(product, currentUserId);
                }
            })
            .catch(error => {
                console.error("Error checking cart items:", error);
                alert("Failed to check cart items. Please try again.");
            });
    }
}


// 添加新的商品到购物车
function addNewItemToCart(product, userId) {
    const newCartItem = {
        productId: product.id, // 商品ID
        userId: userId, // 当前用户ID
        quantity: 1 // 初始数量为1
    };

    // 将商品信息写入后端
    fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newCartItem)
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
        alert("Failed to add item to cart. Please try again.");
    });
}

// 更新购物车中商品数量
function updateCartItem(cartItem) {
    fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cartItem)
    })
    .then(response => {
        if (response.ok) {
            alert("Item quantity updated in cart.");
        } else {
            alert("Failed to update item quantity.");
        }
    })
    .catch(error => {
        console.error("Error updating cart item:", error);
        alert("Failed to update cart item. Please try again.");
    });
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
