// ### VARIABLES ###

// Array de palabras (sin pistas)
var palabras = [
  // ANIMALES (30)
  "cocodrilo", "ornitorrinco", "axolote", "quetzal", "narval", "mantarraya", "armadillo", "okapi", "caracol", "medusa",
  "alce", "pangolin", "koala", "avestruz", "camaleon", "lemur", "mejillon", "colibri", "pulpo", "guepardo",
  "albatros", "cisne", "cachalote", "mariposa", "chimpance", "tarantula", "iguana", "murcielago", "jirafa", "flamenco",

  // GEOGRAFIA (20)
  "estuario", "cordillera", "tundra", "sabana", "canon", "glaciar", "delta", "meseta", "peninsula", "geiser",
  "estepario", "archipielago", "estrato", "badlands", "acuifero", "fiordo", "arrecife", "duna", "taiga", "bahia",

  // TECNOLOGIA (20)
  "blockchain", "algoritmo", "nanotecnologia", "criptomoneda", "sintetizador", "holograma", "biotecnologia",
  "metaverso", "robotica", "fotonica", "ciberseguridad", "drone", "renderizado", "criptografia", "aplicacion",
  "microchip", "cohete", "automatizacion", "dron", "microscopio",

  // ARTE (20)
  "impresionismo", "surrealismo", "cinematografo", "sonata", "fresco", "pictorico", "mosaico", "sinfonia", "opera",
  "haiku", "caligrafia", "gotico", "boceto", "acustica", "acordeon", "arquetipo", "muralismo", "filigrana", "pantomima",
  "vitral",

  // CIENCIAS (25)
  "antimateria", "entropia", "fotosintesis", "mitocondria", "neuroplasticidad", "cromosoma", "taxonomia",
  "paleontologia", "cosmologia", "epigenetica", "termodinamica", "bioquimica", "antropoceno", "ecosistema",
  "particula", "fractal", "singularidad", "exoplaneta", "cloroplasto", "osmosis", "neutrino", "bacteriofago",
  "catalizador", "hidrogeno", "bioinformatica",

  // FILOSOFIA (15)
  "existencialismo", "dialectica", "epistemologia", "utopia", "hedonismo", "paradigma", "sofista", "hermeneutica",
  "nihilismo", "estoicismo", "axioma", "ontologia", "empirismo", "altruismo", "determinismo",

  // HISTORIA (15)
  "zigurat", "legionario", "samurai", "alquimia", "feudalismo", "ilustracion", "neolitico", "olmeca", "bucanero",
  "sestercio", "paleolitico", "codex", "polis", "gladiador", "catapulta",

  // OBJETOS (25)
  "sextante", "papiro", "abaco", "astrolabio", "anfora", "quipu", "theremin", "torno", "meteorito", "bitacora",
  "esfera", "sello", "telar", "fosil", "cetro", "tintero", "atlas", "espejo", "sismografo", "globo", "brujula",
  "robot", "microfono", "telescopio", "impresora",

  // CONCEPTOS (20)
  "paradoja", "efimero", "subliminal", "quintaesencia", "inefable", "transcendencia", "ambivalencia", "perplejidad",
  "serendipia", "solipsismo", "zeitgeist", "efervescencia", "iridiscencia", "sinestesia", "paralaje", "epifania",
  "anamnesis", "perspectiva", "heterotopia", "palimpsesto",

  // VARIOS (10)
  "criptografia", "exoluna", "zoomorfo", "antropofago", "arqueologia", "criptozoologia", "paleoclima", "astrofisica",
  "biodiversidad", "nanobot"
];

// Palabra a averiguar
var palabra = "";
// Nº aleatorio
var rand;
// Palabra oculta
var oculta = [];
// Elemento html de la palabra
var hueco = document.getElementById("palabra");
// Contador de intentos
var contPlayer1 = 6;
var contPlayer2 = 6;
var player = true; // true = jugador 1, false = jugador 2, el jugador 1 es el rojo
var scorePlayer1 = 0;
var scorePlayer2 = 0;

// Botones de letras
var buttons = document.getElementsByClassName('letra');
// Boton de reset
var btnInicio = document.getElementById("reset");

var scoreP1 = document.querySelector(".scoreRojo");
var scoreP2 = document.querySelector(".scoreAmarillo");

var intentosRojos = document.querySelector(".intentosRojo");
var intentosAmarillos = document.querySelector(".intentosAmarillo");
var fin = false; // Variable para controlar el fin del juego


// ### FUNCIONES ###
function inicioJuego() {
  //  Aleatoriazar el Jugador
  if (Math.random() < 0.5) {
    player = true; // Jugador 1
  }
  else {
    player = false; // Jugador 2
  }
}

// Escoger palabra al azar
function generaPalabra() {
  rand = Math.floor(Math.random() * palabras.length);
  palabra = palabras[rand].toUpperCase();
  console.log(palabra);
}


// Funcion para pintar los guiones de la palabra
function pintarGuiones(num) {
  for (var i = 0; i < num; i++) {
    oculta[i] = "_";
  }
  hueco.innerHTML = oculta.join("");
}

//Generar abecedario
function generaABC(a, z) {
  document.getElementById("abcdario").innerHTML = "";
  var i = a.charCodeAt(0), j = z.charCodeAt(0);
  var letra = "";
  mostrarPanel(player);
  if (!fin) {
    for (; i <= j; i++) {
      letra = String.fromCharCode(i).toUpperCase();
      document.getElementById("abcdario").innerHTML += "<button value='" + letra + "' onclick='intento(\"" + letra + "\")' class='letras' id='" + letra + "'>" + letra + "</button>";
    }
  }

}

// chequear intento
function intento(letra) {
  let count = 0;
  // Deshabilitar la letra ya seleccionada
  document.getElementById(letra).disabled = true;

  if (palabra.indexOf(letra) != -1) {
    // La letra existe en la palabra
    for (var i = 0; i < palabra.length; i++) {
      if (palabra[i] == letra) {
        count++;
        oculta[i] = letra;
      }
    }
    hueco.innerHTML = oculta.join("");
    document.getElementById("acierto").innerHTML = "Bien!";
    document.getElementById("acierto").classList.add("acierto", "verde");

    // Incrementar el puntaje del jugador actual
    if (player) {
      scorePlayer1 += calcularCuenta(count, comprobarVocal(letra));
      scoreP1.innerHTML = "Score: " + scorePlayer1;
    } else {
      scorePlayer2 += calcularCuenta(count, comprobarVocal(letra));
      scoreP2.innerHTML = "Score: " + scorePlayer2;
    }
  } else {
    // La letra no está en la palabra
    document.getElementById("acierto").innerHTML = "Fallo!";
    document.getElementById("acierto").classList.add("acierto", "rosa");

    if (player) {
      contPlayer1--;
      // Actualizar contador de intentos para jugador 1
      intentosRojos.innerHTML = "Intentos restantes: " + contPlayer1;
      // Actualizar imagen para jugador 1
      document.getElementById("image" + contPlayer1).classList.add("fade-in");
    } else {
      contPlayer2--;
      // Actualizar contador de intentos para jugador 2
      intentosAmarillos.innerHTML = "Intentos restantes: " + contPlayer2;
      // Actualizar imagen para jugador 2 (nota el sufijo _1)
      document.getElementById("image" + contPlayer2 + "_1").classList.add("fade-in");
    }
  }

  // Alternar el turno: si era true pasa a false y viceversa
  player = !player;

  compruebaFin();
  mostrarPanel(player)
  setTimeout(function () {
    document.getElementById("acierto").className = "";
  }, 800);
}
function comprobarVocal(letra) {
  // Comprobar si la letra es una vocal con switch
  // y devolver true o false
  let boleano = false;
  switch (letra) {
    case 'A':
      boleano = true;
      break;
    case 'E':
      boleano = true;
      break;
    case 'I':
      boleano = true;
      break;

    case 'O':
      boleano = true;
      break;
    case 'U':
      boleano = true;
      break;
    default:
      boleano = false;
      break;
  }
  return boleano;
}



// Función para calcular el puntaje
function calcularCuenta(cuenta, boleano) {
  if (boleano) {
    return 5 * cuenta;
  } else {
    return 10 * cuenta;
  }

}

// Comprueba si ha finalizado
function compruebaFin() {
  // msg-final
  if (oculta.indexOf("_") == -1) {
    if (scorePlayer1 > scorePlayer2) {
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
      }
      if (!fin) {
        fin = true;
        document.getElementById("msg-final").innerHTML = "Ganó el jugador Rosa !!";
        let currentRedVictory = parseInt(localStorage.getItem('victoryPointRed')) || 0;
        localStorage.setItem('victoryPointRed', currentRedVictory + 1);
      }
    }
    else if (scorePlayer1 < scorePlayer2) {
      if (!fin) {
        fin = true;
        document.getElementById("msg-final").innerHTML = "Ganó el jugador Verde !!";
        let currentYellowVictory = parseInt(localStorage.getItem('victoryPointGreen')) || 0;
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].disabled = true;
        }
        localStorage.setItem('victoryPointGreen', currentYellowVictory + 1);
      }
    }
    else {
      if (!fin) {
        fin = true;
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].disabled = true;
        }
        document.getElementById("msg-final").innerHTML = "Empate !!";
      }
      document.getElementById("msg-final").className += " zoom-in";
      document.getElementById("palabra").className += " encuadre";
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
    // Redirige al index.html después de 5 segundos
    setTimeout(function () {
      window.location.href = "index.html";
    }, 5000);
  }
  else if (contPlayer1 == 0) {
    if (!fin) {
      fin = true;
      document.getElementById("msg-final").innerHTML = "El jugador Verde ganó !!";
      document.getElementById("msg-final").className += " zoom-in";
      let currentYellowVictory = parseInt(localStorage.getItem('victoryPointYellow')) || 0;
      localStorage.setItem('victoryPointYellow', currentYellowVictory + 1);
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
      }
    }
    // Redirige al index.html después de 5 segundos
    setTimeout(function () {
      window.location.href = "index.html";
    }, 5000);
  }
  else if (contPlayer2 == 0) {
    if (!fin) {
      fin = true;
      document.getElementById("msg-final").innerHTML = "El jugador Rosa ganó !!";
      document.getElementById("msg-final").className += " zoom-in";
      let currentRedVictory = parseInt(localStorage.getItem('victoryPointRed')) || 0;
      localStorage.setItem('victoryPointRed', currentRedVictory + 1);
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
    // Redirige al index.html después de 5 segundos
    setTimeout(function () {
      window.location.href = "index.html";
    }, 5000);
  }
}

// Mostrar el panel de turno
// Esta función muestra un panel que indica de quién es el turno
// y lo oculta después de 2 segundos.
function mostrarPanel(jugador) {
  // Tiempo de espera para mostrar el panel
  const panel = document.getElementById('turnPanel');
  const turnText = document.getElementById('turnText');
  let jugadorTipo = "";
  if (jugador == true) {
    jugadorTipo = "Rosa";
  }
  else {
    jugadorTipo = "Verde";
  }
  //Cambia el color del panel según el jugador
  // y de la letra
  if (jugador) {
    panel.style.backgroundColor = "rgb(218, 50, 109)";
    turnText.style.color = "white";


  } else {
    panel.style.backgroundColor = "rgb(90, 212, 79)";
    turnText.style.color = "black";
  }

  // Actualiza el texto del turno
  turnText.textContent = 'Turno de Jugador ' + jugadorTipo;

  // Muestra el panel añadiendo la clase "show"
  panel.classList.add('show');

}
// Función para mostrar el panel de fin del juego
function showEndGamePanel() {
  const panel = document.getElementById("endGamePanel");
  panel.classList.add("show");
}


// Restablecer juego
function inicio() {
  inicioJuego();
  generaPalabra();
  pintarGuiones(palabra.length);
  generaABC("a", "z");
}
function eleccionPlayer1() {

}

// Iniciar
window.onload = inicio();