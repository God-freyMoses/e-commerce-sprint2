import {
    addItem,
    removeItem,
    updateQuantity,
    calculateTotal,
    toggleItem,
    fetchProducts,
    findProduct
} from '../js/ecommerce.js';

// Application State
let currentProducts = [];
let cart = [];
let wishlist = [];

const form = document.getElementById("registerForm");
const users = JSON.parse(localStorage.getItem("users")) || [];

// register

// window.addEventListener("DOMContentLoaded", () => {
//   if (users.length) {
//     const u = users[users.length - 1];
//     form.name.value = u.name;
//     form.email.value = u.email;
//   }
// });

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newUser = {
    name: form.name.value.trim(),
    surname: form.surname.value.trim(),
    email: form.email.value.trim(),
    registerPassword: form.registerPassword.value,
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration successful!");
  form.reset();
});

// DOM Elements
const domElements = {
    productsContainer: document.getElementById('products-container'),
    cartIcon: document.getElementById('cart-icon'),
    wishlistIcon: document.getElementById('wishlist-icon'),
    modals: {
        product: document.getElementById('product-modal'),
        cart: document.getElementById('cart-modal'),
        wishlist: document.getElementById('wishlist-modal'),
        login: document.getElementById('login-modal'),
        register: document.getElementById('register-modal')
    }
};
 

// Notification System
const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
};

// Product Rendering
const renderProducts = async () => {
    try {
        currentProducts = await fetchProducts();
        domElements.productsContainer.innerHTML = currentProducts.map(product => `
            <div class="product" data-id="${product.id}">
                ${product.discountPercentage ? `
                    <div class="discount">${product.discountPercentage}%</div>
                ` : ''}
                <img src="${product.thumbnail}" alt="${product.title}">
                <div class="details ">
                    <div class="reviews flex">
                        <i class="bi bi-star-fill"></i> ${product.rating}
                    </div>
                    <div class="title">${product.title}</div>
                    <div class="price">R${product.price.toFixed(2)}</div>
                    <div class="btn-group">
                        <button class="btn-secondary view-btn">View</button>
                        <button class="btn-primary cart-btn"><i class="bi bi-cart-check"></i></button>
                        <button class="btn-secondary wishlist-btn"><i class="bi bi-heart-fill "></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        domElements.productsContainer.innerHTML = `
            <div class="error">⚠️ ${error.message}</div>
        `;
    }
};

// Cart Management
const updateCartUI = () => {
    // Update cart count
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    domElements.cartIcon.querySelector('span').textContent = cartCount;

    // Update cart modal
    const cartContent = domElements.modals.cart.querySelector('.modal-content');
    cartContent.innerHTML = cart.length ? cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.thumbnail}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <h1>R${item.price.toFixed(2)} 
                <br> 
                    <button class="quantity-btn" data-action="decrease"><i class="bi bi-dash-circle-fill "></i></button>
                    ${item.quantity}
                    <button class="quantity-btn" data-action="increase"><i class="bi bi-plus-circle-fill"></i></button>
                </h1>
                <p class="bold">Subtotal: R${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-btn bg-red-500 text-white">Remove</button>
            </div>
        </div>
    `).join('') : '<p>Your cart is empty</p>';

    // Update cart summary
    const total = calculateTotal(cart);
    domElements.modals.cart.querySelector('.cart-summary').innerHTML = `
        <h3 class"text-green-500">Total: R${total.toFixed(2)}</h3>
        <button class="btn-primary checkout-btn">Checkout</button>
        <button class="clear-btn bg-red-500 text-white h-3xl ml-6 p-3 onClick ="removeAll()">Clear Cart</button>

    `;
};

// clear the cart

 function removeAll() {
    
}



// Wishlist Management
const updateWishlistUI = () => {
    const wishlistContent = domElements.modals.wishlist.querySelector('.modal-content');
    wishlistContent.innerHTML = wishlist.length ? wishlist.map(item => `
        <div class="wishlist-item" data-id="${item.id}">
            <img src="${item.thumbnail}" class="wishlist-item-image">
            <div class="wishlist-item-info">
                <h4>${item.title}</h4>
                <p>R${item.price.toFixed(2)}</p>
                <button class="remove-btn">Remove</button>
            </div>
        </div>
    `).join('') : '<p>Your wishlist is empty</p>';
};

// Event Handlers
const setupEventListeners = () => {
    // Product interactions
    domElements.productsContainer.addEventListener('click', async (e) => {
        const productElement = e.target.closest('.product');
        if (!productElement) return;

        const productId = productElement.dataset.id;
        const product = findProduct(currentProducts, productId);

        if (e.target.closest('.view-btn')) {
            const modal = domElements.modals.product;
            modal.querySelector('.product-image').src = product.thumbnail;
            modal.querySelector('h3').textContent = product.title;
            modal.querySelector('.price-display').textContent = `R${product.price.toFixed(2)}`;
            modal.querySelector('.description').textContent = product.description;
            modal.showModal();
        }

        if (e.target.closest('.cart-btn')) {
            cart = addItem(cart, product);
            updateCartUI();
            showNotification('🛒 Added to cart ');
        }

        if (e.target.closest('.wishlist-btn')) {
            const result = toggleItem(wishlist, product);
            wishlist = result.updatedList;
            updateWishlistUI();
            showNotification(result.action === 'added' ?
                '💖 Added to wishlist ' : '❌ Removed from wishlist ');
        }
    });

    // Cart interactions
    domElements.modals.cart.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.cart-item');
        if (!itemElement) return;

        const productId = itemElement.dataset.id;

        if (e.target.closest('.quantity-btn')) {
            const action = e.target.dataset.action;
            cart = updateQuantity(cart, parseInt(productId),
                action === 'increase' ? 1 : -1);
            updateCartUI();
        }

        if (e.target.closest('.remove-btn')) {
            cart = removeItem(cart, parseInt(productId));
            updateCartUI();
            showNotification('Removed from cart 🗑️');
        }
    });

    // Wishlist interactions
    domElements.modals.wishlist.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.wishlist-item');
        if (!itemElement) return;

        const productId = parseInt(itemElement.dataset.id);
        const product = findProduct(currentProducts, productId);

        if (e.target.closest('.remove-btn')) {
            const result = toggleItem(wishlist, product);
            wishlist = result.updatedList;
            updateWishlistUI();
            showNotification('Removed from wishlist ❌');
        }
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('dialog').close();
        });
    });

    // Navigation buttons
    domElements.cartIcon.addEventListener('click', () => {
        updateCartUI();
        domElements.modals.cart.showModal();
    });

    domElements.wishlistIcon.addEventListener('click', () => {
        updateWishlistUI();
        domElements.modals.wishlist.showModal();
    });

    // Auth modal triggers
    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        domElements.modals.login.showModal();
    });

    document.getElementById('register-link').addEventListener('click', (e) => {
        e.preventDefault();
        domElements.modals.register.showModal();
    });
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    await renderProducts();
    setupEventListeners();
});