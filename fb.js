/*
pendientes
funcion que reinicie el juego cuando gameOver
arrelgar hitboxesuna
boton para sinlenciar la musica
*/

// variables de la ventana de juego
let tablero = document.getElementById("tablero");
let tableroWidth = 1200;
let tableroHeight = 800;
let dibujo = tablero.getContext("2d");
tablero.width = tableroWidth;
tablero.height = tableroHeight;

// variables de la meiga
let meigaWidth = 94;
let meigaHeight = 84;
let meigaX = tableroWidth/6;
let meigaY = tableroHeight/4;
let meigaImg = new Image();
meigaImg.src = "assets/imagenes/FB/rana_sinBordeNegro.png";

let meiga = {
    x: meigaX,
    y: meigaY,
    width: meigaWidth,
    height: meigaHeight
};

// variables de las tuberias
let tuberiasArray = [];
let tuberiaWidth = 64;
let tuberiaHeight = 510;
let tuberiaX = tableroWidth;
let tuberiaY = 0;

let tuberiaArribaImg = new Image();
let tuberiaAbajoImg = new Image();
tuberiaArribaImg.src = "assets/imagenes/FB/toppipe.png";
tuberiaAbajoImg.src = "assets/imagenes/FB/bottompipe.png";

// fisicas
let velocidadX = -15;
let velocidadY = 0;
let gravedad = 0.4;

let gameOver = false;
let puntuacion = 0;

// Sonidos
let volarSonido = new Audio("assets/audio/FB/sfx_wing.wav");
let hitSonido = new Audio("assets/audio/FB/sfx_hit.wav");
let fondoSonido = new Audio("assets/audio/FB/Bg_BABA_YAGA.mp3");
fondoSonido.loop = true;

// Iniciar juego
fondoSonido.play();
requestAnimationFrame(update);
setInterval(ponTuberia, 800);
document.addEventListener("keydown", ranaVoladora);

function update() {
    requestAnimationFrame(update);
    if (gameOver) return;
    
    dibujo.clearRect(0, 0, tablero.width, tablero.height);
  
    velocidadY += gravedad;
    meiga.y = Math.max(meiga.y + velocidadY, 0);
    dibujo.drawImage(meigaImg, meiga.x, meiga.y, meiga.width, meiga.height);

    if (meiga.y > tablero.height) {
        gameOver = true;
    }

    // tuberia avanza izquierda
    for (let i = 0; i < tuberiasArray.length; i++) {
        let tuberia = tuberiasArray[i];
        tuberia.x += velocidadX;
        dibujo.drawImage(tuberia.img, tuberia.x, tuberia.y, tuberia.width, tuberia.height);

        if (!tuberia.superado && meiga.x > tuberia.x + tuberia.width) {
            puntuacion += 0.5;
            tuberia.superado = true;
        }

        if (detectarColision(meiga, tuberia)) {
            hitSonido.play();
            gameOver = true;
        }
    }

    // Puntuacion
    dibujo.fillStyle = "white";
    dibujo.font = "45px sans-serif";
    dibujo.fillText(Math.floor(puntuacion), 5, 45);

    if (gameOver) {
        dibujo.fillStyle = "red";
        dibujo.font = "60px 'Courier New', Courier, monospace";
        let textoGameOver = "GAME OVER";
        let textoX = (tablero.width - dibujo.measureText(textoGameOver).width) / 2;
        let textoY = tablero.height / 2;
        dibujo.fillText(textoGameOver, textoX, textoY);
        fondoSonido.pause();
        document.getElementById("reiniciar").style.display = "block";
    }
}

function ponTuberia() {
    let alturaTuberias = tuberiaY - tuberiaHeight/4 - Math.random()*(tuberiaHeight/2);
    let espacioAbierto = tableroHeight/3.5;

    // tuberias de arriba
    let tuberiaArriba = {
        img: tuberiaArribaImg,
        x: tuberiaX,
        y: alturaTuberias,
        width: tuberiaWidth,
        height: tuberiaHeight,
        superado: false
    };
    tuberiasArray.push(tuberiaArriba);

    // Tubería de abajo
    let tuberiaAbajo = {
        img: tuberiaAbajoImg,
        x: tuberiaX,
        y: alturaTuberias + tuberiaHeight + espacioAbierto,
        width: tuberiaWidth,
        height: tuberiaHeight
    };
    tuberiasArray.push(tuberiaAbajo);
}

function reiniciarJuego() {
    meiga.x = meigaX;
    meiga.y = meigaY;
    velocidadY = 0;
    tuberiasArray = [];
    puntuacion = 0;
    gameOver = false;
    fondoSonido.play();
    document.getElementById("reiniciar").style.display = "none";
}

function ranaVoladora(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyW") {
        if (!gameOver) {
            if (fondoSonido.paused) {
                fondoSonido.play();
            }
            volarSonido.play();
            velocidadY = -6;
        }
    }
    if (e.code == "KeyR") {
        reiniciarJuego();
    }
}

function detectarColision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

document.querySelector('.round-back-btn').addEventListener('click', function() {
    window.location.href = 'index.html';
});
  