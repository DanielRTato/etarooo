// Array principal que almacenará todas las cartas de la baraja
var barajaP = [];

var manoJugador = []; // Array para la mano del jugador
var manoRival = []; // Array para la mano de la computadora
var campo = []; // Array para las cartas en el campo
function crear(barajaP) {
  // Contador único para el ID de cada carta
  let contadorP = 1;
  // Cartas especiales (figuras)
  let cartasExtras = ["J", "Q", "K"];
  // Palos de la baraja: Corazones (C), Diamantes (D), Tréboles (H), Picas (P)
  let palosP = ["C", "D", "H", "P"];

  // Creación de cartas numéricas (1-10) ***/
  for (let j = 1; j <= 10; j++) {          // Recorre números del 1 al 10
    for (let i = 0; i < palosP.length; i++) { // Recorre cada palo
      // Crea objeto con propiedades de la carta
      let cartaPObj = {
        id: contadorP,                     // Identificador único
        numero: j,                         // Valor numérico de la carta
        palo: palosP[i],                   // Palo correspondiente
        ruta: "dark/" + j + "-" + palosP[i] + ".png", // Ruta de la imagen
        nombre: j.toString()               // Nombre de la carta (como string)
      };
      barajaP.push(cartaPObj);             // Añade la carta a la baraja
      contadorP++;                         // Incrementa contador de ID
    }
  }

  // Creación de cartas especiales (J, Q, K) ***/
  for (let k = 0; k < cartasExtras.length; k++) { // Recorre figuras
    for (let i = 0; i < palosP.length; i++) {     // Recorre cada palo
      let carta = cartasExtras[k];               // Obtiene la figura actual

      // Asigna valor numérico: J=11, Q=12, K=13
      let valor;
      if (carta === "J") valor = 11;
      else if (carta === "Q") valor = 12;
      else if (carta === "K") valor = 13;

      // Crea objeto con propiedades de la carta
      let cartaPObj = {
        id: contadorP,
        numero: valor,                          // Valor real de la figura
        palo: palosP[i],
        ruta: "dark/" + carta + "-" + palosP[i] + ".png",
        nombre: carta
      };
      barajaP.push(cartaPObj);
      contadorP++;
    }
  }


  // Creación de carta comodín (Joker) JOKER1,JOKER2***/
  for (let i = 0; i < 2; i++) {           // Dos comodines
    let cartaPObj = {
      id: contadorP,
      numero: 0,                          // 0 indica que es figura
      palo: "JOKER",                      // Palo especial para comodín
      ruta: "dark/JOKER" + (i + 1) + ".png", // Ruta de la imagen del comodín
      nombre: "JOKER" + (i + 1)            // Nombre del comodín
    };
    barajaP.push(cartaPObj);
    contadorP++;
  }


  // Muestra la baraja completa en consola (para verificación)
  console.log(barajaP);
  return barajaP; // Devuelve la baraja creada
}

function mezclarBaraja(baraja) {
  for (let i = baraja.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // Índice aleatorio entre 0 e i
    [baraja[i], baraja[j]] = [baraja[j], baraja[i]]; // Intercambiar cartas
  }
}


function repartirCartas(baraja, numMano, numCampo) {
  if (baraja.length < (numMano * 2 + numCampo)) {
    console.error("¡No hay suficientes cartas en la baraja!");
    return;
  }

  manoJugador = [];
  manoRival = [];
  campo = [];

  // Mezcla real de la baraja antes de repartir
  mezclarBaraja(baraja);

  // Repartir a la mano del jugador
  for (let i = 0; i < numMano; i++) {
    manoJugador.push(baraja.pop());
  }

  // Repartir a la mano del rival
  for (let i = 0; i < numMano; i++) {
    manoRival.push(baraja.pop());
  }

  // Colocar cartas en el campo
  for (let i = 0; i < numCampo; i++) {
    campo.push(baraja.pop());
  }

  console.log("Jugador:", manoJugador);
  console.log("Rival:", manoRival);
  console.log("Campo:", campo);
}


// Paneles de juego
let timeoutId = null;

function mostrarMensaje(texto, duracion = 2000, estiloExtra = "") {
  const panel = document.getElementById("mensaje");

  // ‼️ Si hay un temporizador en curso lo cancelamos
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  // Actualizamos el contenido y las clases
  panel.textContent = texto;
  panel.className = `panel ${estiloExtra} show`;

  // Programamos la desaparición
  timeoutId = setTimeout(() => {
    panel.classList.remove("show");
    timeoutId = null;            // limpiamos el registro
  }, duracion);
}

let multiplicadorRojo = 0;
let multiplicadorAmarillo = 0;
let rojoElegido = false;
let amarilloElegido = false;
let rondaEnCurso = false;  // Controla el flujo de la ronda

// Actualiza los valores visualmente
function actualizarMultiplicadores() {
  document.querySelector('.izquierda .multiplicador-panel .valor').textContent = 'x' + multiplicadorRojo;
  document.querySelector('.derecha .multiplicador-panel .valor').textContent = 'x' + multiplicadorAmarillo;
}

// Bloquea los botones de la sección del jugador dado
function bloquearBotones(selector) {
  const botones = document.querySelectorAll(selector);
  botones.forEach(boton => boton.disabled = true);
}

// Desbloquea los botones de la sección del jugador dado
function desbloquearBotones(selector) {
  const botones = document.querySelectorAll(selector);
  botones.forEach(boton => boton.disabled = false);
}

// Función para la elección del jugador rojo
function eleccionRojo(apuestaQueGana) {
  if (rojoElegido || rondaEnCurso) return;
  rojoElegido = true;

  multiplicadorRojo += apuestaQueGana ? 2 : -2;
  actualizarMultiplicadores();
  // se llama a las funciones de bloquear botones hasta que el otro jugador elija
  bloquearBotones(".izquierda .apostar_rojo_Gana");
  bloquearBotones(".izquierda .apostar_rojo_Pierde");

  comprobarRonda();
}

// Función para la elección del jugador amarillo
function eleccionAmarillo(apuestaQueGana) {
  if (amarilloElegido || rondaEnCurso) return;
  amarilloElegido = true;

  multiplicadorAmarillo += apuestaQueGana ? 2 : -2;
  actualizarMultiplicadores();
  // se llama a las funciones de bloquear botones hasta que el otro jugador elija
  bloquearBotones(".derecha .apostar_amarillo_Gana");
  bloquearBotones(".derecha .apostar_amarillo_Pierde");

  comprobarRonda();
}

// Desbloquea todos los botones para una nueva ronda
//Esta funcion se llamara cuando los dos jugadores hayan apostado
function desbloquearTodos() {
  desbloquearBotones(".izquierda .apostar_rojo_Gana");
  desbloquearBotones(".izquierda .apostar_rojo_Pierde");
  desbloquearBotones(".derecha .apostar_amarillo_Gana");
  desbloquearBotones(".derecha .apostar_amarillo_Pierde");
}

// Controla el flujo de la ronda
function comprobarRonda() {
  if (rojoElegido && amarilloElegido) {
    rondaEnCurso = true; // Evitamos más clics mientras termina la ronda
    console.log("¡Ambos han apostado!");
    mostrarMensaje("Siguiente ronda", 2500);
    rondaCampo(); // Muestra las cartas del campo
    setTimeout(() => {
      // Reseteamos el estado para la siguiente ronda
      rojoElegido = false;
      amarilloElegido = false;
      desbloquearTodos();
      rondaEnCurso = false;
      console.log("Nueva ronda. Pueden apostar de nuevo.");
    }, 1500);
  }
}

// Función para mostrar mano
// Se muestra al inicio de la partida
function mostrarMano() {
  let carta1 = document.getElementById("jugador1");
  let carta2 = document.getElementById("jugador2");

// Muestra las cartas del jugador
  carta1.src = manoJugador[0].ruta;
  carta1.alt = manoJugador[0].nombre;

  carta2.src = manoJugador[1].ruta;
  carta2.alt = manoJugador[1].nombre;
}
// Función para mostrar la mano del rival
// La mano se muestra al final después de todas las rondas
function mostrarManoRival() {
  let carta1 = document.getElementById("rival1");
  let carta2 = document.getElementById("rival2");

  carta1.src = manoRival[0].ruta;
  carta1.alt = manoRival[0].nombre;

  carta2.src = manoRival[1].ruta;
  carta2.alt = manoRival[1].nombre;
}


// Variables de control
// Estas variables representan el estado de las cartas en el campo
var comp = false;
var campoDestapado = [false, false, false, true, true];

// Esta función comprueba si todas las cartas del campo están destapadas
// y determina si es el final de la partida
// Si todas las cartas están destapadas, se evalúa quién ganó
// y se actualizan los puntos de los jugadores
function comprobarSiTermino() {
  // Verifica si todas las cartas del campo están destapadas
  const todasDestapadas = campoDestapado.every(estado => estado === true);

  if (todasDestapadas) {
    // Esto es un ciclo para evitar que se ejecute la lógica de victoria justo cuando
    // se destapa la última carta. Se espera un turno adicional.
    if (!comp) {
      comp = true; // Primer ciclo detectando todas destapadas
      return false; // Espera un turno adicional
    } else {
      // ahora empezamos a evaluar quién ganó
      setTimeout(() => {
        const pj = comprobarVictoria(manoJugador, campo); // Comprobamos la mano del jugador
        const pr = comprobarVictoria(manoRival,   campo); // Comprobamos la mano del rival
        // la logica de victoria se trata de una comparacion de puntuación cada mano junto con el
        // campo equivale una puntuación, por eso ahora se compara las puntuaciones, y a partir de esas
        // puntuaciones se determina quién ganó y su respectiva mano
        // Mostrar mensaje y actualizar puntos…
        if (pj > pr) { 
          // Ganó el jugador
          // Se muestra el mensaje de victoria y se actualizan los puntos
          mostrarMensaje("¡Ganó el Jugador con " + obtenerNombreCombinacion(pj) + "!", 7000);
          // Se actualizan los puntos de cada jugador
          // Se llama a la función de calcular puntuación
          // El booleano indica que el jugador perdió y se asigna la puntuacion según el multiplicador de cada apostador
          calcularPuntuacionRojo(multiplicadorRojo, true);
          calcularPuntuacionAmarillo(multiplicadorAmarillo, true);
        }
        else if (pr > pj) {
          // Ganó el rival
          // Se muestra el mensaje de victoria y se actualizan los puntos
          mostrarMensaje("¡Ganó el Rival con " + obtenerNombreCombinacion(pr) + "!", 7000);
          // Se actualizan los puntos de cada jugador
          // Se llama a la función de calcular puntuación
          // El booleano indica que el jugador ganó y se asigna la puntuacion según el multiplicador de cada apostador
          calcularPuntuacionRojo(multiplicadorRojo, false);
          calcularPuntuacionAmarillo(multiplicadorAmarillo, false);
        }
        else {
          // Lógica en cas de empate, osea de que ambos jugadores tengan la misma puntuación
          const aj = [...manoJugador, ...campo];
          const ar = [...manoRival,   ...campo];
          const res = desempatar(aj, ar, pj);
          const dur = 7000; // usar mismo tiempo para todos

          if (res > 0) {
            mostrarMensaje("Desempate: Gana el Jugador con " + obtenerNombreCombinacion(pj), dur);
            calcularPuntuacionRojo(multiplicadorRojo, true);
            calcularPuntuacionAmarillo(multiplicadorAmarillo, true);
          }
          else if (res < 0) {
            mostrarMensaje("Desempate: Gana el Rival con " + obtenerNombreCombinacion(pr), dur);
            calcularPuntuacionRojo(multiplicadorRojo, false);
            calcularPuntuacionAmarillo(multiplicadorAmarillo, false);
          }
          else {
            mostrarMensaje("Empate total", dur);
          }
        }

        // 1) Comprobamos si es fin de partida
        const esFin = verificarFinJuego();
        // 2) Si NO es fin de partida, reiniciamos tras 7s + 1s buffer
        if (!esFin) {
          setTimeout(reiniciarPartida, 8000);
        }
      }, 1000);

      return true;
    }
  }

  return false;
}


function calcularPuntuacionRojo(multiplicadorRojo, comp) {
  let puntuacionRojo;

  // Si el multiplicador es positivo, se apuesta a ganar.
  if (multiplicadorRojo > 0) {
    if (comp) {
      // Si gana, se suma.
      puntuacionRojo = multiplicadorRojo * 100;
    } else {
      // Si pierde, se resta.
      puntuacionRojo = -multiplicadorRojo * 50;
    }
  } else { // multiplicador negativo: apuesta a que gana el rival
    if (!comp) {
      // Si el rival gana (comp es false), se suma.
      puntuacionRojo = Math.abs(multiplicadorRojo) * 100;
    } else {
      // Si el rival pierde (comp es true), se resta.
      puntuacionRojo = -Math.abs(multiplicadorRojo) * 50;
    }
  }

  // Se actualiza el score del rojo, sumando la nueva puntuación al valor actual
  let scoreRojoElem = document.querySelector('.scoreRojo .valor');
  let puntajeActual = Number(scoreRojoElem.innerHTML) || 0;
  scoreRojoElem.innerHTML = puntajeActual + puntuacionRojo;
}

function calcularPuntuacionAmarillo(multiplicadorAmarillo, comp) {
  let puntuacionAmarillo;

  // Si el multiplicador es positivo, se apuesta a ganar.
  if (multiplicadorAmarillo > 0) {
    if (comp) {
      puntuacionAmarillo = multiplicadorAmarillo * 100;
    } else {
      puntuacionAmarillo = -multiplicadorAmarillo * 50;
    }
  } else { // multiplicador negativo: apuesta a que gana el rival
    if (!comp) {
      puntuacionAmarillo = Math.abs(multiplicadorAmarillo) * 100;
    } else {
      puntuacionAmarillo = -Math.abs(multiplicadorAmarillo) * 50;
    }
  }

  // Se actualiza el score del amarillo, sumando la nueva puntuación al valor actual
  let scoreAmarilloElem = document.querySelector('.scoreAmarillo .valor');
  let puntajeActual = Number(scoreAmarilloElem.innerHTML) || 0;
  scoreAmarilloElem.innerHTML = puntajeActual + puntuacionAmarillo;
}

// Esta funcion modifica el array de cartas del campo en cada ronda, destapando carta a carta del campo
// Tambien se encarga de verificar si el juego ha terminado
function rondaCampo() {
  // de derecha a izquierda, cambia el array de cartas del campo de falso a verdadero
  for (let i = campo.length - 1; i >= 0; i--) {
    if (!campoDestapado[i]) {
      campoDestapado[i] = true; // Destapa esa carta
      break; // sale del bucle (solo destapamos 1)
    }
  }
  // Verifica si todas las cartas del campo están destapadas
  if (comprobarSiTermino()) {
    mostrarManoRival(); // Muestra la mano del rival al terminar
    // El resto de la lógica de quién gana está en comprobarSiTermino()
  }

  // Actualiza la visualización del campo
  destaparCartasCampo();
}
// Esta funcion se encarga de mostrar las cartas del campo según el array modificado en cada ronda por la funcion rondaCampo
function destaparCartasCampo() {
  // Recorre el array si encuentra true muestra la carta en dicha posición
  for (let i = 0; i < campo.length; i++) {
    if (campoDestapado[i] === true) {
      let cartaCampo = document.getElementById("mesa" + (i + 1));
      cartaCampo.src = campo[i].ruta;
      cartaCampo.alt = campo[i].nombre;
    }
  }
}
// Variable para almacenar la puntuación de cada jugador
var puntuacionRojo = 0;
var puntuacionAmarillo = 0;

/*********************************************
 *    Funciones de Utilidad
 *********************************************/
// Cuenta cuántas veces aparece cada número
// Devuelve un objeto con el conteo de cada número
/**
 * getCounts(regularCards)
 *
 * Esta función sirve para contar cuántas veces aparece cada número
 * en un conjunto de cartas. Es útil cuando quieres saber, por ejemplo,
 * si tienes pares, tríos o más cartas del mismo valor.
 *
 * Cómo funciona, paso a paso:
 *
 * 1. Crear un lugar vacío para guardar los conteos:
 *    - Usamos un objeto `counts` donde cada propiedad será
 *      el número de carta y su valor será cuántas veces salió.
 *
 * 2. Recorrer todas las cartas del array `regularCards`:
 *    - Por cada carta:
 *      a) Miramos su `numero` (por ejemplo, 4, 7 o 12).
 *      b) Vemos cuántas veces hemos visto ya ese número:
 *         - Si aún no está en `counts`, asumimos que son 0.
 *      c) Le sumamos 1, porque acabamos de ver otra carta de ese mismo número.
 *
 * 3. Al terminar de recorrerlas todas, `counts` tendrá este formato:
 *      {
 *        '4': 2,   // apareció la carta número 4 dos veces
 *        '7': 1,   // apareció la carta número 7 una vez
 *        '12': 3   // apareció la carta número 12 tres veces
 *      }
 *
 * 4. Devolver ese objeto para que quien llame a la función
 *    pueda usar esos datos y decidir, por ejemplo, si hay
 *    un par, un trío o más de un mismo valor.
 *
 * Ejemplo rápido:
 *    const mano = [{ numero: 5 }, { numero: 5 }, { numero: 9 }];
 *    getCounts(mano); // → { '5': 2, '9': 1 }
 */
function getCounts(regularCards) {
  let counts = {}; // 1. Objeto vacío para acumular resultados
  regularCards.forEach(c => { // 2. Recorremos cada carta del array
    counts[c.numero] = (counts[c.numero] || 0) + 1;
    // 2.b) Tomamos el conteo previo o 0, y le sumamos 1
  });
  return counts; // 3. Devolvemos el objeto con todos los conteos
}

// Cuenta cuántas cartas hay de cada palo
/**
 * getSuitCounts(regularCards)
 *
 * Esta función cuenta cuántas cartas hay de cada palo
 * en un conjunto dado. Útil para saber si, por ejemplo,
 * predominan los corazones, tréboles, diamantes o picas.
 *
 * Cómo funciona, paso a paso:
 *
 * 1. Crear un objeto vacío `suits` donde guardaremos los conteos:
 *    - Cada propiedad de `suits` será el nombre del palo
 *      (por ejemplo, 'corazones', 'picas', 'diamantes', 'tréboles').
 *    - El valor asociado a esa propiedad será cuántas cartas
 *      de ese palo hay en el array.
 *
 * 2. Recorrer todas las cartas del array `regularCards`:
 *    - Por cada carta `c`:
 *      a) Leemos `c.palo` (el palo de la carta).
 *      b) Consultamos cuántas veces hemos visto ese palo antes:
 *         - Si no existe aún (`undefined`), asumimos que son 0.
 *      c) Sumamos 1 a ese contador, porque acabamos de encontrar
 *         otra carta de ese mismo palo.
 *
 * 3. Al terminar el bucle, `suits` tendrá este formato:
 *      {
 *        'corazones': 3,   // hubo 3 cartas de corazones
 *        'picas': 2,       // hubo 2 cartas de picas
 *        'diamantes': 1,   // hubo 1 carta de diamantes
 *        'tréboles': 4     // hubo 4 cartas de tréboles
 *      }
 *
 * 4. Devolver el objeto `suits` para que quien use la función
 *    pueda consultar fácilmente cuántas cartas de cada palo hay.
 *
 * Ejemplo rápido:
 *    const mano = [
 *      { palo: 'corazones' },
 *      { palo: 'tréboles' },
 *      { palo: 'corazones' },
 *      { palo: 'picas' }
 *    ];
 *    getSuitCounts(mano);
 *    // → { 'corazones': 2, 'tréboles': 1, 'picas': 1 }
 */
function getSuitCounts(regularCards) {
  let suits = {};
  regularCards.forEach(c => {
    suits[c.palo] = (suits[c.palo] || 0) + 1;
  });
  console.log(suits);
  return suits;
}

// Devuelve el número de carta más alto (teniendo en cuenta As como 14)
// solo sirve para mostrar cual es la carta mas alta del grupo de cartas que le pases
function getHighestNumber(regularCards) {
  return Math.max(
    ...regularCards.map(c => (c.numero === 1 ? 14 : c.numero))
  );
}

/*********************************************
 *    Funciones de Chequeo de Combinaciones
 *********************************************/

// 1) Check: Escalera Real (Royal Flush)
// Sigue devolviendo booleano; en comprobarVictoria se mapea a 800 puntos.
function checkRoyalFlush(regularCards, jokersCount) {
  if (jokersCount >= 5) return true; // 5 jokers ⇒ Royal directa

  // Inicializamos todos los palos (C, D, H, P)
  const suits = { C: [], D: [], H: [], P: [] };
  regularCards.forEach(c => {
    const val = c.numero === 1 ? 14 : c.numero;
    if (!suits[c.palo]) suits[c.palo] = [];
    suits[c.palo].push(val);
  });

  const needed = [10, 11, 12, 13, 14];
  for (const suit in suits) {
    const uniqueVals = [...new Set(suits[suit])];
    const faltan = needed.filter(r => !uniqueVals.includes(r)).length;
    if (faltan <= jokersCount) {
      return true;
    }
  }
  return false;
}

// 2) Check: Escalera de Color (Straight Flush)
// Devuelve 700 + carta alta, o 0.
function checkStraightFlush(regularCards, jokersCount) {
  if (jokersCount >= 5) {
    return 700 + 14;
  }

  // Agrupamos rangos por palo, incluyendo As como 1 y 14
  const bySuit = {};
  regularCards.forEach(c => {
    const palo = c.palo;
    if (!bySuit[palo]) bySuit[palo] = [];
    if (c.numero === 1) {
      bySuit[palo].push(1, 14);
    } else {
      bySuit[palo].push(c.numero);
    }
  });

  let maxHigh = 0;
  for (const suit in bySuit) {
    const unique = [...new Set(bySuit[suit])].sort((a, b) => a - b);

    // Rueda baja A-2-3-4-5
    if (unique.includes(1)) {
      const wheel = [1, 2, 3, 4, 5];
      const miss = wheel.filter(n => !unique.includes(n)).length;
      if (miss <= jokersCount) {
        maxHigh = Math.max(maxHigh, 5);
      }
    }

    // Cualquier otra escalera de largo 5
    for (let high = 5; high <= 14; high++) {
      const seq = [];
      for (let n = high - 4; n <= high; n++) seq.push(n);
      const miss = seq.filter(n => !unique.includes(n)).length;
      if (miss <= jokersCount) {
        maxHigh = Math.max(maxHigh, high);
      }
    }
  }

  return maxHigh > 0 ? 700 + maxHigh : 0;
}

// 3) Check: Póker (Four of a Kind)
// Devuelve 600 + valor del cuádruple, o 0.
function checkFourOfAKind(regularCards, jokersCount) {
  const counts = getCounts(regularCards);
  let maxNum = 0;

  if (jokersCount >= 4) {
    maxNum = 14;
  } else {
    for (const num in counts) {
      if (counts[num] + jokersCount >= 4) {
        maxNum = Math.max(maxNum, parseInt(num, 10));
      }
    }
  }

  return maxNum > 0 ? 600 + maxNum : 0;
}

// 4) Check: Full House
// Devuelve 500 + valor del trío, o 0.
function checkFullHouse(regularCards, jokersCount) {
  const counts = getCounts(regularCards);
  let trio = 0;

  // 1) Buscar tríos naturales
  for (const num in counts) {
    if (counts[num] >= 3) {
      trio = Math.max(trio, parseInt(num, 10));
    }
  }
  // 2) Si no hay, usar jokers para formar trío
  if (trio === 0) {
    for (const num in counts) {
      if (counts[num] + jokersCount >= 3) {
        trio = Math.max(trio, parseInt(num, 10));
      }
    }
  }

  // Cuántos jokers hemos usado en el trío
  const usedForTrio = trio > 0
    ? Math.max(0, 3 - (counts[trio] || 0))
    : 0;
  const availableJ = jokersCount - usedForTrio;

  // 3) Buscar o formar pareja distinta al trío
  let pair = 0;
  for (const num in counts) {
    const n = parseInt(num, 10);
    if (n !== trio) {
      if (counts[num] >= 2 || counts[num] + availableJ >= 2) {
        pair = Math.max(pair, n);
      }
    }
  }

  return (trio > 0 && pair > 0) ? 500 + trio : 0;
}


// 5) Check: Color (Flush)
// Devuelve 400 + valor de la carta alta del palo, o 0.
function checkFlush(regularCards, jokersCount) {
  // Flush con ≥5 jokers
  if (jokersCount >= 5) {
    return 400 + 14;
  }

  const suitsCount = getSuitCounts(regularCards);
  let maxCount = 0, maxSuit = null;
  for (const suit in suitsCount) {
    const total = suitsCount[suit] + jokersCount;
    if (total > maxCount) {
      maxCount = total;
      maxSuit = suit;
    }
  }

  if (maxCount >= 5) {
    // Carta alta en ese palo
    let highest = 0;
    regularCards.forEach(c => {
      if (c.palo === maxSuit) {
        const val = c.numero === 1 ? 14 : c.numero;
        highest = Math.max(highest, val);
      }
    });
    if (jokersCount > 0) highest = 14;
    return 400 + highest;
  }

  return 0;
}

// 6) Check: Escalera (Straight)
// Devuelve 300 + valor de inicio de la escalera, o 0.
function checkStraight(regularCards, jokersCount) {
  const modified = regularCards
    .map(c => (c.numero === 1 ? [1, 14] : [c.numero]))
    .flat();
  const unique = [...new Set(modified)].sort((a, b) => a - b);
  let maxLow = 0;

  for (let low = 1; low <= 10; low++) {
    const seq = [low, low + 1, low + 2, low + 3, low + 4];
    const miss = seq.filter(n => !unique.includes(n)).length;
    if (miss <= jokersCount) {
      maxLow = Math.max(maxLow, low);
    }
  }

  return maxLow > 0 ? 300 + maxLow : 0;
}


// 7) Check: Trío (Three of a Kind)
// Devuelve 200 + valor del trío, o 0.
function checkThreeOfAKind(regularCards, jokersCount) {
  const counts = getCounts(regularCards);
  let maxNum = 0;
  for (const num in counts) {
    if (counts[num] + jokersCount >= 3) {
      maxNum = Math.max(maxNum, parseInt(num, 10));
    }
  }
  return maxNum > 0 ? 200 + maxNum : 0;
}

// 8) Check: Doble Pareja (Two Pair)
// Devuelve 150 si hay dos pares, o 0.
function checkTwoPair(regularCards, jokersCount) {
  const counts = getCounts(regularCards);
  const naturalPairs = [];
  const singletons   = [];

  for (const num in counts) {
    const n = parseInt(num, 10);
    if (counts[num] >= 2) {
      naturalPairs.push(n);
    } else if (counts[num] === 1) {
      singletons.push(n);
    }
  }

  let availableJ = jokersCount;
  const pairs = [...naturalPairs];

  // Usar 1 joker para convertir cada singleton en par
  singletons
    .sort((a, b) => b - a)
    .forEach(n => {
      if (availableJ >= 1 && !pairs.includes(n)) {
        pairs.push(n);
        availableJ--;
      }
    });

  // Permitir 4 jokers como dos pares “libres”
  if (pairs.length < 2 && jokersCount >= 4) {
    return 150;
  }

  return pairs.length >= 2 ? 150 : 0;
}

// 9) Check: Pareja (One Pair)
// Devuelve 100 si hay al menos un par, o 0.
function checkPair(regularCards, jokersCount) {
  const counts = getCounts(regularCards);
  for (const num in counts) {
    if (counts[num] + jokersCount >= 2) {
      return 100;
    }
  }
  return jokersCount >= 2 ? 100 : 0;
}

/*********************************************
 *    Función Principal de Comprobación
 *********************************************/
function comprobarVictoria(manoV, campoV) {
  // Validación inicial
  if (!manoV || !campoV || manoV.length === 0 || campoV.length === 0) {
    console.error("¡Manos o campo vacíos!");
    return 0;
  }

  // 1) Unimos ambas “manos”
  let allCards = [...manoV, ...campoV];

  // 2) Separamos comodines de cartas normales
  let jokers = allCards.filter(c => c.numero === 0);
  let regularCards = allCards.filter(c => c.numero !== 0);
  let jokersCount = jokers.length;

  // 3) Vamos chequeando combinaciones en orden de más alta a más baja
  if (checkRoyalFlush(regularCards, jokersCount)) {
    return 800; // Escalera Real
  }

  let straightFlush = checkStraightFlush(regularCards, jokersCount);
  if (straightFlush) {
    return straightFlush; // 700 + carta alta
  }

  let fourOfAKind = checkFourOfAKind(regularCards, jokersCount);
  if (fourOfAKind) {
    return fourOfAKind; // 600 + número del póker
  }

  let fullHouse = checkFullHouse(regularCards, jokersCount);
  if (fullHouse) {
    return fullHouse; // 500 + número del trío
  }

  let flush = checkFlush(regularCards, jokersCount);
  if (flush) {
    return flush; // 400 + carta alta
  }

  let straight = checkStraight(regularCards, jokersCount);
  if (straight) {
    return straight; // 300 + base escalera
  }

  let threeOfAKind = checkThreeOfAKind(regularCards, jokersCount);
  if (threeOfAKind) {
    return threeOfAKind; // 200 + valor
  }

  let twoPair = checkTwoPair(regularCards, jokersCount);
  if (twoPair) {
    return twoPair; // 150
  }

  let pair = checkPair(regularCards, jokersCount);
  if (pair) {
    return pair; // 100
  }

  // Si no hay nada, carta más alta (considerando As=14 si hay comodines)
  let highCard = getHighestNumber(regularCards);
  if (jokersCount > 0) {
    // Con comodines, asumimos que la carta alta puede ser 14
    highCard = Math.max(highCard, 14);
  }
  return highCard; // 0..14
}

/*********************************************  
 *    Función Principal de Desempate
 *********************************************/
function desempatar(manoA, manoB, puntuacionEmpate) {
  if (puntuacionEmpate === 800) {
    // Royal Flush vs Royal Flush: no hay desempate
    return 0;
  } else if (puntuacionEmpate >= 700) {
    return desempatarStraightFlush(manoA, manoB);
  } else if (puntuacionEmpate >= 600) {
    return desempatarFourOfAKind(manoA, manoB);
  } else if (puntuacionEmpate >= 500) {
    return desempatarFullHouse(manoA, manoB);
  } else if (puntuacionEmpate >= 400) {
    return desempatarFlush(manoA, manoB);
  } else if (puntuacionEmpate >= 300) {
    return desempatarStraight(manoA, manoB);
  } else if (puntuacionEmpate >= 200) {
    return desempatarThreeOfAKind(manoA, manoB);
  } else if (puntuacionEmpate >= 150) {
    return desempatarTwoPair(manoA, manoB);
  } else if (puntuacionEmpate >= 100) {
    return desempatarOnePair(manoA, manoB);
  } else {
    return desempatarHighCard(manoA, manoB);
  }
}

/*********************************************
 *    Desempate por Escalera de Color
 *********************************************/
function desempatarStraightFlush(manoA, manoB) {
  const topA = getTopStraightFlushValue(manoA);
  const topB = getTopStraightFlushValue(manoB);
  if (topA > topB) return 1;
  if (topB > topA) return -1;
  return 0;
}

function getTopStraightFlushValue(mano) {
  // Agrupa por palo
  const bySuit = {};
  mano.forEach(c => {
    const v = c.numero === 1 ? 14 : c.numero;
    (bySuit[c.palo] = bySuit[c.palo] || []).push(v);
  });
  let best = 0;
  for (let s in bySuit) {
    const seqTops = getStraightTopsFromSorted(
      [...new Set(bySuit[s])].sort((a,b)=>a-b)
    );
    seqTops.forEach(t => { if (t > best) best = t; });
  }
  return best;
}

/*********************************************
 *    Desempate por Póker (Four of a Kind)
 *********************************************/
function desempatarFourOfAKind(manoA, manoB) {
  const { quad: qa, kicker: ka } = getPokerData(manoA);
  const { quad: qb, kicker: kb } = getPokerData(manoB);
  if (qa > qb) return 1;
  if (qb > qa) return -1;
  if (ka > kb) return 1;
  if (kb > ka) return -1;
  return 0;
}

function getPokerData(mano) {
  const vals = mano.map(c => c.numero === 1 ? 14 : c.numero);
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v]||0) + 1);
  let quad = 0;
  for (let v in counts) {
    if (counts[v] === 4 && +v > quad) quad = +v;
  }
  const kicker = vals.filter(v => v !== quad).sort((a,b)=>b-a)[0] || 0;
  return { quad, kicker };
}

/*********************************************
 *    Desempate por Full House
 *********************************************/
function desempatarFullHouse(manoA, manoB) {
  const da = getFullHouseData(manoA);
  const db = getFullHouseData(manoB);
  if (!da || !db) throw new Error('Alguna mano no es full-house');

  if (da.trio !== db.trio) return Math.sign(da.trio - db.trio);
  return Math.sign(da.pair - db.pair);
}

function getFullHouseData(mano) {
  const counts = {};
  mano.forEach(({ numero }) => {
    const v = numero === 1 ? 14 : numero;
    counts[v] = (counts[v] || 0) + 1;
  });

  let trio = 0, pair = 0;
  for (const [vStr, cnt] of Object.entries(counts)) {
    const v = +vStr;
    if (cnt >= 3 && v > trio) trio = v;
  }
  for (const [vStr, cnt] of Object.entries(counts)) {
    const v = +vStr;
    if (v !== trio && cnt >= 2 && v > pair) pair = v;
  }

  return trio && pair ? { trio, pair } : null;
}

/*********************************************
 *    Desempate por Color (Flush)
 *********************************************/
function desempatarFlush(manoA, manoB) {
  const fa = getFlushCards(manoA);
  const fb = getFlushCards(manoB);
  for (let i = 0; i < 5; i++) {
    if (fa[i] > fb[i]) return 1;
    if (fb[i] > fa[i]) return -1;
  }
  return 0;
}

function getFlushCards(mano) {
  const bySuit = {};
  mano.forEach(c => {
    const v = c.numero === 1 ? 14 : c.numero;
    (bySuit[c.palo] = bySuit[c.palo] || []).push(v);
  });
  // elegir el palo con ≥5 cartas (o el que dé más valor si varios)
  let bestSuit = null, bestCards = [];
  for (let s in bySuit) {
    if (bySuit[s].length >= 5) {
      const sorted = bySuit[s].sort((a,b)=>b-a);
      if (!bestSuit || sorted[0] > bestCards[0]) {
        bestSuit = s;
        bestCards = sorted;
      }
    }
  }
  return bestCards.slice(0, 5);
}

/*********************************************
 *    Desempate por Escalera (Straight)
 *********************************************/
function desempatarStraight(manoA, manoB) {
  const sa = getTopStraightValue(manoA);
  const sb = getTopStraightValue(manoB);
  if (sa > sb) return 1;
  if (sb > sa) return -1;
  return 0;
}

function getTopStraightValue(mano) {
  const vals = mano.map(c => c.numero === 1 ? 14 : c.numero);
  const unique = [...new Set(vals)].sort((a,b)=>a-b);
  const tops = getStraightTopsFromSorted(unique);
  return tops.length ? Math.max(...tops) : 0;
}

/*********************************************
 *    Desempate por Trío (Three of a Kind)
 *********************************************/
function desempatarThreeOfAKind(manoA, manoB) {
  const { trioValue: ta, kickers: ka } = getThreeOfAKindData(manoA);
  const { trioValue: tb, kickers: kb } = getThreeOfAKindData(manoB);
  if (ta > tb) return 1;
  if (tb > ta) return -1;
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] > kb[i]) return 1;
    if (kb[i] > ka[i]) return -1;
  }
  return 0;
}

function getThreeOfAKindData(mano) {
  const vals = mano.map(c => c.numero === 1 ? 14 : c.numero);
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v]||0) + 1);
  let trioValue = 0;
  for (let v in counts) {
    if (counts[v] >= 3 && +v > trioValue) trioValue = +v;
  }
  const kickers = vals
    .filter(v => v !== trioValue)
    .sort((a,b)=>b-a)
    .slice(0, 2);
  return { trioValue, kickers };
}

/*********************************************
 *    Desempate por Doble Pareja (Two Pair)
 *********************************************/
function desempatarTwoPair(manoA, manoB) {
  const { highPair: hA, lowPair: lA, kicker: kA } = getTwoPairData(manoA);
  const { highPair: hB, lowPair: lB, kicker: kB } = getTwoPairData(manoB);
  if (hA > hB) return 1;
  if (hB > hA) return -1;
  if (lA > lB) return 1;
  if (lB > lA) return -1;
  if (kA > kB) return 1;
  if (kB > kA) return -1;
  return 0;
}

function getTwoPairData(mano) {
  const vals = mano.map(c => c.numero === 1 ? 14 : c.numero);
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v]||0) + 1);
  const pairs = Object.keys(counts)
    .filter(v => counts[v] >= 2)
    .map(v => +v)
    .sort((a,b)=>b-a);
  const highPair = pairs[0] || 0;
  const lowPair  = pairs[1] || 0;
  const kicker   = vals
    .filter(v => v !== highPair && v !== lowPair)
    .sort((a,b)=>b-a)[0] || 0;
  return { highPair, lowPair, kicker };
}

/*********************************************
 *    Desempate por Pareja (One Pair)
 *********************************************/
function desempatarOnePair(manoA, manoB) {
  const { pairValue: pA, kickers: kA } = getOnePairData(manoA);
  const { pairValue: pB, kickers: kB } = getOnePairData(manoB);
  if (pA > pB) return 1;
  if (pB > pA) return -1;
  for (let i = 0; i < kA.length; i++) {
    if (kA[i] > kB[i]) return 1;
    if (kB[i] > kA[i]) return -1;
  }
  return 0;
}

function getOnePairData(mano) {
  const vals = mano.map(c => c.numero === 1 ? 14 : c.numero);
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v]||0) + 1);
  const pairValue = Math.max(
    0,
    ...Object.entries(counts)
      .filter(([v, cnt]) => cnt >= 2)
      .map(([v]) => +v)
  );
  const kickers = vals
    .filter(v => v !== pairValue)
    .sort((a,b)=>b-a)
    .slice(0, 3);
  return { pairValue, kickers };
}

/*********************************************
 *    Desempate por Carta Alta (High Card)
 *********************************************/
function desempatarHighCard(manoA, manoB) {
  const a = get5HighestCards(manoA);
  const b = get5HighestCards(manoB);
  for (let i = 0; i < 5; i++) {
    if (a[i] > b[i]) return 1;
    if (b[i] > a[i]) return -1;
  }
  return 0;
}

function get5HighestCards(mano) {
  return mano
    .map(c => c.numero === 1 ? 14 : c.numero)
    .sort((a,b)=>b-a)
    .slice(0, 5);
}

/*********************************************
 *    Auxiliar: Buscar secuencias en un array
 *********************************************/
function getStraightTopsFromSorted(sorted) {
  const local = sorted.includes(14) ? [1, ...sorted] : [...sorted];
  const results = [];
  let seq = [local[0]];

  for (let i = 1; i < local.length; i++) {
    if (local[i] === local[i-1] + 1) {
      seq.push(local[i]);
    } else if (local[i] !== local[i-1]) {
      seq = [local[i]];
    }
    if (seq.length >= 5) {
      results.push(seq[seq.length - 1]);
    }
  }
  return results;
}


/*********************************************
 *    Función para traducir la puntuación
 *********************************************/
function obtenerNombreCombinacion(puntuacion) {
  if (puntuacion === 800) {
    return "Escalera Real";
  } else if (puntuacion >= 700) {
    return "Escalera de Color";
  } else if (puntuacion >= 600) {
    return "Póker";
  } else if (puntuacion >= 500) {
    return "Full House";
  } else if (puntuacion >= 400) {
    return "Color";
  } else if (puntuacion >= 300) {
    return "Escalera";
  } else if (puntuacion >= 200) {
    return "Trío";
  } else if (puntuacion >= 150) {
    return "Doble Pareja";
  } else if (puntuacion >= 100) {
    return "Pareja";
  }
  return "Carta Alta";
}

/*********************************************
 *    Ejemplo de Uso Final
 *********************************************/

// Una función ejemplo que, dados manos y campos de dos jugadores,
// 1) obtiene la puntuación de cada uno,
// 2) en caso de empate llama a desempatar(...),
// 3) imprime o retorna quién ganó (o si hay empate).
function determinarGanador(manoRojo, campoRojo, manoAmarillo, campoAmarillo) {
  // Calculamos las puntuaciones
  puntuacionRojo = comprobarVictoria(manoRojo, campoRojo);
  puntuacionAmarillo = comprobarVictoria(manoAmarillo, campoAmarillo);

  if (puntuacionRojo > puntuacionAmarillo) {
    return "Gana Jugador Rojo con " + obtenerNombreCombinacion(puntuacionRojo);
  } else if (puntuacionAmarillo > puntuacionRojo) {
    return "Gana Jugador Amarillo con " + obtenerNombreCombinacion(puntuacionAmarillo);
  } else {
    // Empate en puntuación => Se intenta desempatar
    let resultado = desempatar(
      // Pasar TODAS las cartas, no solo las 2 de mano
      [...manoRojo, ...campoRojo],
      [...manoAmarillo, ...campoAmarillo],
      puntuacionRojo
    );
    if (resultado > 0) {
      return "Desempate: Gana Jugador Rojo con " + obtenerNombreCombinacion(puntuacionRojo);
    } else if (resultado < 0) {
      return "Desempate: Gana Jugador Amarillo con " + obtenerNombreCombinacion(puntuacionAmarillo);
    } else {
      return "Empate total: Ambos tienen " + obtenerNombreCombinacion(puntuacionRojo);
    }
  }
}
// 1) Función para reiniciar la partida (sin resetear las puntuaciones)
//    — bloquea botones, reinicia estado e inicia de nuevo.
function reiniciarPartida() {
  // 1) Bloquear todas las apuestas mientras se reinicia
  bloquearBotones(".izquierda .apostar_rojo_Gana");
  bloquearBotones(".izquierda .apostar_rojo_Pierde");
  bloquearBotones(".derecha .apostar_amarillo_Gana");
  bloquearBotones(".derecha .apostar_amarillo_Pierde");

  // 2) Reset de estado interno: comp y destapado
  comp = false;
  // Mantener siempre destapadas las dos últimas del campo
  campoDestapado = [false, false, false, true, true];

  // 3) Reset de multiplicadores y actualización visual
  multiplicadorRojo = 0;
  multiplicadorAmarillo = 0;
  actualizarMultiplicadores();

  // 4) Poner boca abajo todas las cartas que quedan tapadas
  //    (manos y las primeras 3 del campo)
  //    las dos últimas del campo se reharán al llamar a inicio()
  document.querySelectorAll(".jugador .carta, .rival .carta").forEach(img => {
    img.src = "dark/BACK.png";
    img.alt = "BACK";
  });
  for (let i = 1; i <= 3; i++) {
    const mesa = document.getElementById("mesa" + i);
    mesa.src = "dark/BACK.png";
    mesa.alt = "BACK";
  }

  // 5) Mensaje y, tras dos segundos, volver a iniciar
  mostrarMensaje("¡Nueva partida!", 2000);
  setTimeout(() => {
    inicio();         // crea baraja, reparte y muestra mano + mesa
    desbloquearTodos(); // habilita de nuevo los botones de apuesta
  }, 2000);
}


// 2) Función para comprobar los scores, actualizar el contador de victorias,
//    avisar quién ha ganado y redirigir si toca
// 2) Función para comprobar los scores, avisar quién ha ganado, redirigir y devolver si es fin de todo
function verificarFinJuego(currPlayer) {
  const rojoElem     = document.querySelector('.scoreRojo .valor');
  const amarilloElem = document.querySelector('.scoreAmarillo .valor');
  const scoreRojo     = rojoElem     ? Number(rojoElem.textContent)     : 0;
  const scoreAmarillo = amarilloElem ? Number(amarilloElem.textContent) : 0;

  const rojoGana     = scoreRojo     >= 0 || scoreAmarillo     <= -850;
  const amarilloGana = scoreAmarillo >= 0 || scoreRojo <= -850;

  if (!rojoGana && !amarilloGana) {
    if(scoreAmarillo==scoreRojo){
      return false;
    }
  } else if(rojoGana && amarilloGana){
    if(scoreRojo==scoreAmarillo){
      return false;
    }
    
  }

  let ganador;
  if (rojoGana && !amarilloGana) {
    ganador = 'Jugador Rosa';
  } else if (amarilloGana && !rojoGana) {
    ganador = 'Jugador Verde';
  } else {
    if(scoreAmarillo>scoreRojo){
      ganador = 'Jugador Verde';
    }else if(scoreRojo>scoreAmarillo){
      ganador = 'Jugador Rosa';
    }
  }

  // ahora asignas claveLS, idSpan y estilo según “ganador”
  const isRojo = ganador === 'Jugador Rojo';
  const claveLS = isRojo ? 'victoryPointRed' : 'victoryPointYellow';
  const idSpan  = isRojo ? 'redVictories'      : 'yellowVictories';
  const estilo  = isRojo ? 'rojo'               : 'amarillo';

  // incrementar contador
  const nuevoContador = (parseInt(localStorage.getItem(claveLS), 10) || 0) + 1;
  localStorage.setItem(claveLS, nuevoContador);

  // actualizar UI
  const span = document.getElementById(idSpan);
  if (span) span.textContent = nuevoContador;

  // mensaje y redirección
  mostrarMensaje(
    `¡${ganador} gana la partida! Volviendo al menú…`,
    7000 
  );
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 7000);

  return true;
}


function inicio() {
  let barajaActual = crear(barajaP); // Llama a la función crear para inicializar la baraja
  repartirCartas(barajaActual, 2, 5);
  mostrarMano(); // Muestra la mano del jugador
  destaparCartasCampo(); // <-- esta es la que destapa las dos que tienen true
}

// Llama a inicio sin parámetros
window.onload = function () {
  mostrarMensaje("¡Empecemos!", 2500);
  inicio(); // 
};
