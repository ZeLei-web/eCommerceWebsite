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
