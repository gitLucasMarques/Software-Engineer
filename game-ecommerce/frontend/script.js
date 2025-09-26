// Espera o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
    const botoesVer = document.querySelectorAll(".ver");
    const botoesCarrinho = document.querySelectorAll(".carrinho");
    const campoBusca = document.getElementById("campo-busca");
    const botaoBusca = document.getElementById("botao-busca");

    // Ação para "Ver mais"
    botoesVer.forEach(botao => {
        botao.addEventListener("click", () => {
            alert("Você clicou em Ver mais!");
        });
    });

    // Ação para "Adicionar ao carrinho"
    botoesCarrinho.forEach(botao => {
        botao.addEventListener("click", () => {
            alert("Produto adicionado ao carrinho!");
        });
    });

    // Ação para busca
    botaoBusca.addEventListener("click", () => {
        const termo = campoBusca.value;
        alert("Buscando por: " + termo);
    });
});

// Simulação de carrinho (em memória)
let carrinho = [];

// Botões "Adicionar ao carrinho"
document.querySelectorAll(".carrinho")?.forEach(botao => {
    botao.addEventListener("click", (e) => {
        const produto = e.target.closest(".produto") || e.target.closest(".produto-detalhe");
        const nome = produto.querySelector(".nome")?.innerText || "Produto";
        carrinho.push(nome);
        alert(nome + " adicionado ao carrinho!");
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
    });
});

// Página do carrinho
if (window.location.pathname.includes("carrinho.html")) {
    const listaCarrinho = document.getElementById("lista-carrinho");
    const itens = JSON.parse(localStorage.getItem("carrinho")) || [];

    if (itens.length > 0) {
        listaCarrinho.innerHTML = "<ul>" + itens.map(p => `<li>${p}</li>`).join("") + "</ul>";
    }

    document.getElementById("finalizar").addEventListener("click", () => {
        alert("Compra finalizada com sucesso!");
        localStorage.removeItem("carrinho");
        location.reload();
    });
}
