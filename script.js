
const blocos = document.querySelectorAll(".animar");

const observador = new IntersectionObserver((itens) => {
    itens.forEach((item) => {
        if (item.isIntersecting) {
            item.target.classList.add("visivel");
            observador.unobserve(item.target);
        }
    });
});

blocos.forEach((bloco) => observador.observe(bloco));
