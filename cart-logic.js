let cart = [];

function toggleCart() {
    const modal = document.getElementById('cart-count');
    const cartM = document.getElementById('cartModal');
    cartM.classList.toggle('hidden');
    cartM.classList.toggle('flex');
}

function addToCart(name, price, img) {
    cart.push({ name, price: parseFloat(price), img });
    updateCartUI();
    closeModal();
    toggleCart();
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const container = document.getElementById('cart-items');
    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-3">
                    <img src="${item.img}" class="w-10 h-10 rounded object-cover">
                    <span class="text-xs font-bold">${item.name}</span>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500 text-xs">حذف</button>
            </div>`;
    }).join('');
    document.getElementById('cart-total').innerText = total + " SAR";
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function handleCheckout() {
    const phone = document.getElementById('checkout-phone').value;
    if(cart.length === 0) return alert("السلة فارغة");
    if(!phone) return alert("أدخل رقم الجوال");
    
    const total = cart.reduce((s, i) => s + i.price, 0);
    const items = cart.map(i => i.name).join(' + ');
    
    // استدعاء دالتك الأصلية في payment.js
    processPayment(items, total, phone);
}
