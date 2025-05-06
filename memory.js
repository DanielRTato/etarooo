// Cargar los sonidos
const sonidoCorrecto = new Audio('assets/audio/Memory/coin.mp3');
const sonidoIncorrecto = new Audio('assets/audio/Memory/negative.mp3');
const sonidoGanador = new Audio('assets/audio/Memory/winning.mp3');
const sonidoClick = new Audio('assets/audio/Memory/click.mp3');

// Hacer que el sonido pueda reproducirse de nuevo sin esperar a que termine
sonidoClick.loop = false; // Asegurarse de que no sea repetido
sonidoClick.volume = 1;  // Ajusta el volumen si es necesario

// Seleccionar todos los botones
const botones = document.querySelectorAll('button');

// Agregar el evento de clic a cada botón para reproducir el sonido
botones.forEach(boton => {
  boton.addEventListener('click', () => {
    // Reproducir el sonido de clic cada vez que se presiona un botón
    sonidoClick.currentTime = 0; // Reinicia el tiempo de reproducción
    sonidoClick.play(); // Reproduce el sonido de clic
  });
});
const imagenesDisponibles = [
  'assets/img/Bola+Soporte.png',
  'assets/img/frascoPluma.png',
  'assets/img/Fogata.png',
  'assets/img/FrascoPetaloH.png',
  'assets/img/PocionExp.png',
  'assets/img/FuegoAzul.png'
];

let cartas = [];
let cartasSeleccionadas = [];
let movimientosActuales = 0;
let intentosActuales = 0;
let turno = 1; // 1 = Jugador 1, 2 = Jugador 2
let puntaje1 = 0;
let puntaje2 = 0;

function actualizarEstadisticas() {
  document.querySelector('#stats').innerHTML = `${intentosActuales} intentos`;
  document.querySelector('#turn').innerText = `Turno: Jugador ${turno}`;
  document.querySelector('#score1').innerText = puntaje1;
  document.querySelector('#score2').innerText = puntaje2;
}

function activarCarta(e) {
  if (movimientosActuales < 2) {
    const carta = e.target.closest('.card');
    if (!carta || carta.classList.contains('active')) return;

    carta.classList.add('active');
    cartasSeleccionadas.push(carta);

    if (++movimientosActuales === 2) {
      intentosActuales++;
      actualizarEstadisticas();

      const valor1 = cartasSeleccionadas[0].querySelector('.face').innerHTML;
      const valor2 = cartasSeleccionadas[1].querySelector('.face').innerHTML;

      if (valor1 === valor2) {
        sonidoCorrecto.play();
        turno === 1 ? puntaje1++ : puntaje2++;

        if (puntaje1 + puntaje2 === imagenesDisponibles.length) {
          sonidoGanador.play();
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 70,
              origin: { y: 0.6 }
            });

            const mensaje = document.getElementById('ganador');
            const ganadorSpan = document.getElementById('ganadorNombre');
            ganadorSpan.innerText = turno;
            mensaje.classList.remove('oculto');
            mensaje.classList.add('mostrar');
          }, 500);
        }

        cartasSeleccionadas = [];
        movimientosActuales = 0;
        actualizarEstadisticas();
      } else {
        sonidoIncorrecto.play();
        cartasSeleccionadas[0].classList.add('shake');
        cartasSeleccionadas[1].classList.add('shake');

        setTimeout(() => {
          cartasSeleccionadas[0].classList.remove('active', 'shake');
          cartasSeleccionadas[1].classList.remove('active', 'shake');
          cartasSeleccionadas = [];
          movimientosActuales = 0;
          turno = turno === 1 ? 2 : 1;
          actualizarEstadisticas();
        }, 500);
      }
    }
  }
}

function generarValoresCartas() {
  const valores = [];
  imagenesDisponibles.forEach((_, i) => {
    valores.push(i, i); // Cada imagen tiene un par
  });

  for (let i = valores.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [valores[i], valores[j]] = [valores[j], valores[i]];
  }
  return valores;
}

function iniciarJuego() {
  cartasSeleccionadas = [];
  movimientosActuales = 0;
  intentosActuales = 0;
  turno = 1;
  puntaje1 = 0;
  puntaje2 = 0;
  actualizarEstadisticas();

  const mensaje = document.getElementById('ganador');
  mensaje.classList.remove('mostrar');
  mensaje.classList.add('oculto');

  const contenedorJuego = document.querySelector('#game');
  contenedorJuego.innerHTML = '';
  cartas = [];

  const valoresBarajados = generarValoresCartas();
  valoresBarajados.forEach((valor) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <div class="back"></div>
      <div class="face"><img src="${imagenesDisponibles[valor]}" alt="imagen"></div>
    `;
    div.addEventListener('click', activarCarta);
    cartas.push(div);
    contenedorJuego.appendChild(div);
  });
}

document.querySelector('#reset-btn').addEventListener('click', iniciarJuego);
window.onload = iniciarJuego;

document.querySelector('.round-back-btn').addEventListener('click', function() {
  window.location.href = 'index.html';
  
});
// Mostrar panel de ayuda
document.getElementById('help-btn')
  .addEventListener('click', () => {
    document.getElementById('help-panel').classList.remove('hidden');
  });

// Cerrar panel de ayuda
document.getElementById('close-help')
  .addEventListener('click', () => {
    document.getElementById('help-panel').classList.add('hidden');
  });