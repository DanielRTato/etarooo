document.addEventListener('DOMContentLoaded', () => {
    // Efecto hover para los botones
    const botonesJuego = document.querySelectorAll('.boton-juego');
    
    botonesJuego.forEach(boton => {
        boton.addEventListener('mouseenter', () => {
            boton.style.transform = 'scale(1.1)';
        });
        
        boton.addEventListener('mouseleave', () => {
            boton.style.transform = 'scale(1)';
        });
    });
});