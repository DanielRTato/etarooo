document.addEventListener('DOMContentLoaded', () => {
    // Obtener todos los botones de juego
    const playButtons = document.querySelectorAll('.play-btn');
    
    // Agregar evento click a cada botón
    playButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const gameId = e.target.closest('.game-card').id;
            switch(gameId) {
                case 'ahorcado':
                    window.location.href = 'Ahorcado.html';
                    break;
                case 'candy-crush':
                    window.location.href = 'Cc.html';
                    break;
                case 'flappy-bird':
                    window.location.href = 'fb.html';
                    break;
                case 'memory':
                    window.location.href = 'memory.html';
                    break;
            }
        });
    });
});
