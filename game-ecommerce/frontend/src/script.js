const products = [
    { id: 1, name: "Minecraft", price: 110.00, image: "https://http2.mlstatic.com/D_NQ_NP_2X_954325-MLB54972665736_042023-F.webp" },
    { id: 2, name: "God of War: Ragnarok", price: 239.90, image: "https://http2.mlstatic.com/D_NQ_NP_2X_954325-MLB54972665736_042023-F.webp" },
    { id: 3, name: "Horizon", price: 239.90, image: "https://http2.mlstatic.com/D_NQ_NP_2X_954325-MLB54972665736_042023-F.webp" }
];

let cartCount = 0;

function renderProducts(filter = "") {
    const productsSection = document.getElementById('products');
    productsSection.innerHTML = '';
    products
        .filter(product => product.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(product => {
            const div = document.createElement('div');
            div.className = 'product';
            div.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p>Preço: R$ ${product.price.toFixed(2)}</p>
                <button onclick="addToCart()">Comprar</button>
            `;
            productsSection.appendChild(div);
        });
}

function addToCart() {
    cartCount++;
    document.getElementById('cart-count').textContent = cartCount;
}

document.getElementById('search').addEventListener('input', function() {
    renderProducts(this.value);
});

renderProducts();