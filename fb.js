/*
pendientes
funcion que reinicie el juego cuando gameOver
arrelgar hitboxesuna
*/

// variables de la ventana de juego
let tablero;
let tableroWidth = 1200;  // dimensiones del tablero
let tableroHeight = 800; // dimensiones del tablero
let dibujo;
 
// variables de la meiga
let meigaWidth = 94
let meigaHeight = 84;
let meigaX = tableroWidth /6//8
let meigaY = tableroHeight/2 //2
let meigaImg

let meiga = {
    x : meigaX,
    y : meigaY,
    width : meigaWidth,
    height : meigaHeight,
}

// NUEVAS VARIABLES
let turnoJugador = 1;
let puntuacionJugador1 = 0;
let puntuacionJugador2 = 0;
let juegoTerminado = false;

// variables de las tuberias
let tuberiasArray= []
let tuberiaWidth = 64 //64 
let tuberiaHeight = 510 //512
let tuberiaX = tableroWidth
let tuberiaY = 0

let tuberiaArribaImg
let tuberiaAbajoImg

// fisicas
let velocidadX = -15
let velocidadY = 0 // meiga velociadad de vuelo
let gravedad = 0.4

let gameOver = false
let puntuacion = 0

// Sonidos
let volarSonido = new Audio();
let hitSonido = new Audio();
let fondoSonido = new Audio();

// Intentar cargar los sonidos
try {
    volarSonido.src = "assets/audio/FB/sfx_wing.wav";
    hitSonido.src = "assets/audio/FB/sfx_hit.wav";
    fondoSonido.src = "assets/audio/FB/Bg_BABA_YAGA.mp3";
    fondoSonido.loop = true;
} catch (error) {
    console.error("Error loading sounds:", error);
    mostrarError('Error al cargar los sonidos. El juego continuará sin sonido.');
}


window.onload = function() { 
    
    tablero = document.getElementById("tablero")
    tablero.width = tableroWidth
    tablero.height = tableroHeight
    dibujo = tablero.getContext("2d")

    // Cargar imágenes
    const images = {
        meiga: new Image(),
        topPipe: new Image(),
        bottomPipe: new Image()
    };

    // Obtener la ruta absoluta del directorio del juego
    const baseDir = window.location.href.split('/').slice(0, -1).join('/') + '/';
    
    images.meiga.src = baseDir + "assets/imagenes/FB/Rana_sinBordeNegro.svg";
    images.topPipe.src = baseDir + "assets/imagenes/FB/toppipe.png";
    images.bottomPipe.src = baseDir + "assets/imagenes/FB/bottompipe.png";

    // Manejo de errores para las imágenes
    images.meiga.onerror = () => {
        console.error('Error al cargar la imagen de la meiga');
        mostrarError('No se pudo cargar la imagen de la meiga');
    };
    images.topPipe.onerror = () => {
        console.error('Error al cargar la imagen de la tubería superior');
        mostrarError('No se pudo cargar la imagen de la tubería superior');
    };
    images.bottomPipe.onerror = () => {
        console.error('Error al cargar la imagen de la tubería inferior');
        mostrarError('No se pudo cargar la imagen de la tubería inferior');
    };

    // Esperar a que todas las imágenes se carguen
    let loadedImages = 0;
    const totalImages = 3;
    const MAX_LOAD_TIME = 5000; // 5 segundos
    let loadTimer;

    function handleImageLoad() {
        loadedImages++;
        if (loadedImages === totalImages) {
            // Todas las imágenes cargadas
            meigaImg = images.meiga;
            tuberiaArribaImg = images.topPipe;
            tuberiaAbajoImg = images.bottomPipe;
            dibujo.drawImage(meigaImg, meiga.x, meiga.y, meiga.width, meiga.height);
            requestAnimationFrame(update);
            setInterval(ponTuberia, 800);
            document.addEventListener("keydown", ranaVoladora);
            
            // Emitir evento para ocultar pantalla de carga
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            clearTimeout(loadTimer);
        }
    }

    // Configurar timeout en caso de que las imágenes no se carguen
    loadTimer = setTimeout(() => {
        if (loadedImages < totalImages) {
            mostrarError('Error al cargar las imágenes. Por favor, verifica que tienes conexión a internet y que las imágenes están en la carpeta correcta.');
        }
    }, MAX_LOAD_TIME);

    // Función para mostrar errores
    function mostrarError(mensaje) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.querySelector('h2').textContent = 'Error al cargar el juego';
            loadingScreen.querySelector('p').textContent = mensaje;
        }
    }

    // Agregar event listeners para las imágenes
    Object.values(images).forEach(img => {
        img.onload = handleImageLoad;
        img.onerror = function() {
            console.error(`Error loading image: ${this.src}`);
            alert("Error loading game assets. Please make sure all game files are in the correct location.");
        };
    });
}


function update() {
    
    requestAnimationFrame(update);
    if (gameOver){
        return 
    }
    dibujo.clearRect(0, 0, tablero.width, tablero.height);
  
    velocidadY += gravedad
    meiga.y = Math.max(meiga.y + velocidadY, 0);
    dibujo.drawImage(meigaImg, meiga.x, meiga.y, meiga.width, meiga.height); // meiga

    if (meiga.y > tablero.height){
        gameOver = true
    }

    // tuberia avanza izquierda
    for (let i = 0; i < tuberiasArray.length; i++) {
        let tuberia = tuberiasArray[i];
        tuberia.x += velocidadX; 
        dibujo.drawImage(tuberia.img, tuberia.x, tuberia.y, tuberia.width, tuberia.height);

        if (!tuberia.superado && meiga.x > tuberia.x + tuberia.width){
            puntuacion += 0.5
            tuberia.superado = true
        }

        if (detectarColision(meiga, tuberia)) {
            hitSonido.play();
            gameOver = true
        }
    }
    // PUntuacion
    dibujo.fillStyle = "white"
    dibujo.font = "45px sans-serif"
    dibujo.fillText (puntuacion,5,45)

    if(gameOver) {
        // Centrar el texto "GAME OVER"
        dibujo.fillStyle = "red"; // Color rojo para destacar
        dibujo.font = "60px 'Courier New', Courier, monospace"; // Fuente más grande y consistente
        let textoGameOver = "GAME OVER";
        let textoX = (tablero.width - dibujo.measureText(textoGameOver).width) / 2; // Centrar horizontalmente
        let textoY = tablero.height / 2; // Centrar verticalmente
        dibujo.fillText(textoGameOver, textoX, textoY);

        // Pausar la música de fondo
        fondoSonido.pause();

        // Mostrar el botón de reinicio
        document.getElementById("reiniciar").style.display = "block";
    }

}

function ponTuberia(){

    let alturaTuberias = tuberiaY - tuberiaHeight/4 - Math.random()*(tuberiaHeight/2)
    let espacioAbierto = tableroHeight/3.5 //4.5 original

    // tuberias de arriba
    let tuberiaArriba = {
        img : tuberiaArribaImg,
        x : tuberiaX,
        y : alturaTuberias,
        width : tuberiaWidth,
        height : tuberiaHeight,
        superado : false
    }
    tuberiasArray.push(tuberiaArriba)

    // Tubería de abajo
    let tuberiaAbajo = {
        img: tuberiaAbajoImg,
        x: tuberiaX,
        y: alturaTuberias + tuberiaHeight + espacioAbierto,
        width: tuberiaWidth,
        height: tuberiaHeight,
        
    }
    tuberiasArray.push(tuberiaAbajo)
}

function reiniciarJuego() {
    meiga.x = meigaX;
    meiga.y = meigaY;
    velocidadY = 0;
    tuberiasArray = [];
    puntuacion = 0;
    gameOver = false;
    fondoSonido.play();

    document.getElementById("reiniciar").style.display = "none"; // Ocultar botón
}

function ranaVoladora(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyW") {
        if (!gameOver) {
            if (fondoSonido.paused) {
                fondoSonido.play();
            }

            volarSonido.play();
            velocidadY = -6; // Movimiento normal
        }
    }
    // Reiniciar con R
    if (e.code == "KeyR") {
        reiniciarJuego();
    }
}

function detectarColision (a,b){
    return   a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
    a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}