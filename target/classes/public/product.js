const API_BASE = "http://localhost:4567";
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

let currentImageIndex = 0;
let images = [];
const productImage = document.getElementById("product-image");
const thumbnailContainer = document.getElementById("thumbnail-container");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");

<<<<<<< HEAD
=======
// 添加放大镜相关 DOM 和样式
const zoomLens = document.createElement("div");
zoomLens.classList.add("zoom-lens");
const zoomContainer = document.createElement("div");
zoomContainer.classList.add("zoom-container");
document.body.appendChild(zoomContainer);

>>>>>>> 7213e9117fc049b3bc0cc5b9ec22fb97d1737a74
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
<<<<<<< HEAD
    const maxImages = 10; // 假设最多有10张图片
=======
>>>>>>> 7213e9117fc049b3bc0cc5b9ec22fb97d1737a74

    function loadNextImage() {
        const imagePath = `products/${productId}${index === 0 ? "" : `-${index}`}.jpg`;
        const img = new Image();
        img.src = imagePath;

        img.onload = () => {
<<<<<<< HEAD
            images.push(imagePath); // 加载成功的图片路径
            addThumbnail(imagePath, index); // 添加缩略图
            if (index === 0) {
                updateImage(); // 显示原图
            }
            index++;
            if (index < maxImages) {
                loadNextImage(); // 继续加载下一张图片
            }
=======
            images.push(imagePath); // 图片加载成功，添加到数组
            addThumbnail(imagePath, index); // 添加缩略图
            if (index === 0) updateImage(); // 更新主图为第一张
            index++;
            loadNextImage(); // 尝试加载下一张图片
>>>>>>> 7213e9117fc049b3bc0cc5b9ec22fb97d1737a74
        };

        img.onerror = () => {
            console.warn(`Image not found: ${imagePath}`);
<<<<<<< HEAD
            // 如果找不到图片，停止加载后续图片
            if (index === 0) {
                const defaultImage = "products/default.jpg"; // 使用默认图片
                productImage.src = defaultImage;
            }
=======
            if (index === 0) { // 如果是第一张图片没有找到，使用默认图片
                const defaultImage = "products/default.jpg";
                productImage.src = defaultImage;
                zoomContainer.style.backgroundImage = `url(${defaultImage})`;
                console.warn("Using default image.");
            }
            // 如果没有更多图片，停止加载
            if (index > 0) return;
>>>>>>> 7213e9117fc049b3bc0cc5b9ec22fb97d1737a74
        };
    }

    loadNextImage(); // 开始加载图片
}

<<<<<<< HEAD
// 添加缩略图
=======

>>>>>>> 7213e9117fc049b3bc0cc5b9ec22fb97d1737a74
function addThumbnail(imagePath, index) {
    const thumbnail = document.createElement("img");
    thumbnail.src = imagePath;
    thumbnail.classList.add("thumbnail");
    thumbnail.addEventListener("click", () => {
        currentImageIndex = index;
<<<<<<< HEAD
        updateImage(); // 更新主图
=======
        updateImage();
        zoomContainer.style.backgroundImage = `url(${imagePath})`;
>>>>>>> 7213e9117fc049b3bc0cc5b9ec22fb97d1737a74
    });
    thumbnailContainer.appendChild(thumbnail);
}

<<<<<<< HEAD
// 更新主图
function updateImage() {
    if (images.length > 0) {
        productImage.src = images[currentImageIndex]; // 更新主图路径
    } else {
        const defaultImage = "products/default.jpg"; // 使用默认图片
        productImage.src = defaultImage;
    }
}

=======
function updateImage() {
    if (images.length > 0) {
        productImage.src = images[currentImageIndex];
        zoomContainer.style.backgroundImage = `url(${images[currentImageIndex]})`;
    } else {
        // 使用默认图片
        const defaultImage = "products/default.jpg";
        productImage.src = defaultImage;
        zoomContainer.style.backgroundImage = `url(${defaultImage})`;
        console.warn("Using default image.");
    }
}


>>>>>>> 7213e9117fc049b3bc0cc5b9ec22fb97d1737a74
// 导航按钮
prevButton.addEventListener("click", () => {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateImage();
<<<<<<< HEAD
=======
        zoomContainer.style.backgroundImage = `url(${images[currentImageIndex]})`;
>>>>>>> 7213e9117fc049b3bc0cc5b9ec22fb97d1737a74
    }
});

nextButton.addEventListener("click", () => {
    if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        updateImage();
<<<<<<< HEAD
    }
});
=======
        zoomContainer.style.backgroundImage = `url(${images[currentImageIndex]})`;
    }
});

// 放大镜功能
productImage.addEventListener("mousemove", (e) => {
    if (images.length === 0) return; // 无图片时，不启用放大功能

    const rect = productImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    zoomContainer.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    zoomContainer.style.display = "block";

    zoomContainer.style.top = `${rect.top}px`;
    zoomContainer.style.left = `${rect.right + 20}px`;
    zoomContainer.style.width = `${rect.width}px`;
    zoomContainer.style.height = `${rect.height}px`;
});


productImage.addEventListener("mouseleave", () => {
    zoomContainer.style.display = "none";
});


>>>>>>> 7213e9117fc049b3bc0cc5b9ec22fb97d1737a74
