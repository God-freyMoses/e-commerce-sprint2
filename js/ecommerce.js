// Core cart operations
function addItem(cart, product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  return cart;
}


function clearCart(cart) {
  console.log("clear cart");
  cart.length = 0;
  // cart.splice(0, cart.length);
  updateCartUI();
  return cart;    
}

// //filter product by category
function filterProduct(products, category) {
  if (!category) return products; 
  return products.filter(product => 
    product.category && product.category.toLowerCase() === category.toLowerCase()
  );
}


function removeItem(cart, productId) {
  return cart.filter((item) => item.id !== productId);
}

function updateQuantity(cart, productId, delta) {
  return cart
    .map((item) => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    })
    .filter(Boolean);
}

function calculateTotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Wishlist operations

function toggleItem(wishlist, product) {
  const index = wishlist.findIndex((item) => item.id === product.id);
  if (index > -1) {
    wishlist.splice(index, 1);
    return { updatedList: [...wishlist], action: "removed" };
  }
  return { updatedList: [...wishlist, product], action: "added" };
}

// Product fetching and validation
async function fetchProducts() {
  try {
    const response = await fetch("https://dummyjson.com/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    const { products } = await response.json();
    return validateProducts(products);
  } catch (error) {
    throw new Error(`Product Service Error: ${error.message}`);
  }
}

function validateProducts(products) {
  return products.map((product) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    description: product.description,
    thumbnail: product.thumbnail,
    rating: product.rating.toFixed(1),
    discountPercentage: Math.round(product.discountPercentage),
    category : product.category,
    warantee : product.warrantyInformation,
  }));
}

function findProduct(products, productId) {
  return products.find((p) => p.id === parseInt(productId));
}

export {
  addItem,
  removeItem,
  updateQuantity,
  calculateTotal,
  toggleItem,
  validateProducts,
  fetchProducts,
  findProduct,
  clearCart,
  filterProduct
};
