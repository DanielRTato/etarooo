document.querySelector('.round-back-btn').addEventListener('click', function() {
    window.location.href = 'index.html';
});

// Configuración del juego
const configuracion = {
    filas: 8,
    columnas: 8,
    tiposElementos: ['Gota', 'Hoja', 'Petalo', 'Seta', 'Concha', 'Pluma'],
    niveles: [
        {
            movimientos: 20,
            objetivos: [
                { tipo: 'Gota', cantidad: 15 },
                { tipo: 'Hoja', cantidad: 10 }
            ],
            probabilidadEspecial: 0.1
        },
        {
            movimientos: 18,
            objetivos: [
                { tipo: 'Petalo', cantidad: 20 },
                { tipo: 'Seta', cantidad: 12 },
                { tipo: 'Gota', cantidad: 8 }
            ],
            probabilidadEspecial: 0.15
        },
        {
            movimientos: 15,
            objetivos: [
                { tipo: 'Seta', cantidad: 25 },
                { tipo: 'Petalo', cantidad: 15 },
                { tipo: 'Hoja', cantidad: 10 }
            ],
            probabilidadEspecial: 0.2
        }
    ]
};

// Estado del juego
const estado = {
    tablero: [],
    puntuacion: 0,
    movimientos: 0,
    nivelActual: 0,
    objetivos: [],
    elementoSeleccionado: null,
    bloqueado: false
};

// Inicializar el juego
function iniciarJuego(nivel = 0) {
    estado.nivelActual = nivel;
    const configNivel = configuracion.niveles[nivel];
    
    estado.movimientos = configNivel.movimientos;
    estado.objetivos = JSON.parse(JSON.stringify(configNivel.objetivos));
    estado.puntuacion = 0;
    estado.elementoSeleccionado = null;
    estado.bloqueado = false;
    
    crearTablero();
    dibujarTablero();
    actualizarUI();
    dibujarObjetivos();
}

// Crear el tablero
function crearTablero() {
    estado.tablero = [];
    for (let fila = 0; fila < configuracion.filas; fila++) {
        estado.tablero[fila] = [];
        for (let columna = 0; columna < configuracion.columnas; columna++) {
            estado.tablero[fila][columna] = {
                tipo: obtenerElementoAleatorio(fila, columna),
                especial: null
            };
        }
    }
    
    while (buscarCombinaciones().length > 0) {
        rellenarEspaciosVacios();
    }
}

// Obtener elemento aleatorio evitando combinaciones iniciales
function obtenerElementoAleatorio(fila, columna) {
    let elementosPosibles = [...configuracion.tiposElementos];
    
    if (columna >= 2) {
        const izquierda1 = estado.tablero[fila][columna-1]?.tipo;
        const izquierda2 = estado.tablero[fila][columna-2]?.tipo;
        if (izquierda1 && izquierda1 === izquierda2) {
            elementosPosibles = elementosPosibles.filter(e => e !== izquierda1);
        }
    }
    
    if (fila >= 2) {
        const arriba1 = estado.tablero[fila-1][columna]?.tipo;
        const arriba2 = estado.tablero[fila-2][columna]?.tipo;
        if (arriba1 && arriba1 === arriba2) {
            elementosPosibles = elementosPosibles.filter(e => e !== arriba1);
        }
    }
    
    return elementosPosibles.length > 0 
        ? elementosPosibles[Math.floor(Math.random() * elementosPosibles.length)]
        : configuracion.tiposElementos[Math.floor(Math.random() * configuracion.tiposElementos.length)];
}

// Dibujar el tablero
function dibujarTablero() {
    const tableroHTML = document.getElementById('tablero');
    tableroHTML.innerHTML = '';
    
    for (let fila = 0; fila < configuracion.filas; fila++) {
        for (let columna = 0; columna < configuracion.columnas; columna++) {
            const celda = document.createElement('div');
            celda.className = 'celda';
            celda.dataset.fila = fila;
            celda.dataset.columna = columna;
            
            const elemento = document.createElement('div');
            elemento.className = 'elemento';
            
            const celdaTablero = estado.tablero[fila][columna];
            let imagen = 'vacio.png';
            
            if (celdaTablero.tipo) {
                if (celdaTablero.especial) {
                    if (celdaTablero.especial === 'FrascoH') {
                        imagen = `Frasco${celdaTablero.tipo}H.png`;
                    } else if (celdaTablero.especial === 'FrascoV') {
                        imagen = `Frasco${celdaTablero.tipo}V.png`;
                    } else if (celdaTablero.especial === 'PocionExp') {
                        imagen = 'PocionExp.png';
                    } else if (celdaTablero.especial.startsWith('Bolsa')) {
                        imagen = `${celdaTablero.especial}.png`;
                    }
                } else {
                    imagen = `${celdaTablero.tipo}.png`;
                }
            }
            
            elemento.style.backgroundImage = `url('assets/imagenes/CC/${imagen}')`;
            celda.appendChild(elemento);
            celda.addEventListener('click', () => manejarClic(fila, columna));
            tableroHTML.appendChild(celda);
        }
    }
}

// Dibujar objetivos
function dibujarObjetivos() {
    const container = document.getElementById('objetivos-container');
    container.innerHTML = '';
    
    estado.objetivos.forEach(objetivo => {
        const elementoObjetivo = document.createElement('div');
        elementoObjetivo.className = 'objetivo';
        
        elementoObjetivo.innerHTML = `
            <div class="icono" style="background-image: url('assets/imagenes/CC/${objetivo.tipo}.png')"></div>
            <div class="texto">Recolectar ${objetivo.cantidad} ${objetivo.tipo}s</div>
            <div class="progreso">0/${objetivo.cantidad}</div>
        `;
        
        container.appendChild(elementoObjetivo);
    });
}

// Animación de caída mejorada (como la versión anterior que preferías)
function animarCaida(filaOrigen, columnaOrigen, filaDestino, columnaDestino) {
    // Solo actualiza el tablero sin animación visual
    estado.tablero[filaDestino][columnaDestino] = {...estado.tablero[filaOrigen][columnaOrigen]};
    estado.tablero[filaOrigen][columnaOrigen] = {tipo: null, especial: null};
}

// Animación para nuevos elementos
function animarNuevoElemento(fila, columna) {
    const celda = document.querySelector(`.celda[data-fila="${fila}"][data-columna="${columna}"] .elemento`);
    if (celda) {
        celda.style.transform = 'scale(0)';
        setTimeout(() => {
            celda.style.transition = 'transform 0.3s ease';
            celda.style.transform = 'scale(1)';
        }, 10);
    }
}

// Resaltar celda seleccionada
function resaltarCelda(fila, columna, seleccionada) {
    const celdas = document.querySelectorAll('.celda');
    const indice = fila * configuracion.columnas + columna;
    celdas[indice].classList.toggle('seleccionada', seleccionada);
}

// Animación de intercambio
function animarIntercambio(fila1, columna1, fila2, columna2, callback) {
    const celda1 = document.querySelector(`.celda[data-fila="${fila1}"][data-columna="${columna1}"]`);
    const celda2 = document.querySelector(`.celda[data-fila="${fila2}"][data-columna="${columna2}"]`);
    const elemento1 = celda1.querySelector('.elemento');
    const elemento2 = celda2.querySelector('.elemento');
    
    elemento1.style.transition = 'transform 0.3s ease';
    elemento2.style.transition = 'transform 0.3s ease';
    
    const dirX = columna2 - columna1;
    const dirY = fila2 - fila1;
    
    elemento1.style.transform = `translate(${dirX * 100}%, ${dirY * 100}%)`;
    elemento2.style.transform = `translate(${-dirX * 100}%, ${-dirY * 100}%)`;
    
    setTimeout(() => {
        // Intercambiar en el modelo
        const temp = {...estado.tablero[fila1][columna1]};
        estado.tablero[fila1][columna1] = {...estado.tablero[fila2][columna2]};
        estado.tablero[fila2][columna2] = temp;
        
        // Resetear transformaciones
        elemento1.style.transition = 'none';
        elemento2.style.transition = 'none';
        elemento1.style.transform = 'none';
        elemento2.style.transform = 'none';
        
        // Redibujar
        dibujarTablero();
        if (callback) callback();
    }, 300);
}

// Buscar combinaciones
function buscarCombinaciones() {
    const combinaciones = [];
    
    // Combinaciones horizontales
    for (let fila = 0; fila < configuracion.filas; fila++) {
        for (let columna = 0; columna < configuracion.columnas - 2; columna++) {
            const tipo = estado.tablero[fila][columna].tipo;
            if (tipo && tipo === estado.tablero[fila][columna+1].tipo && tipo === estado.tablero[fila][columna+2].tipo) {
                let longitud = 3;
                while (columna + longitud < configuracion.columnas && estado.tablero[fila][columna+longitud].tipo === tipo) {
                    longitud++;
                }
                
                const celdas = Array.from({length: longitud}, (_, i) => ({fila, columna: columna + i}));
                combinaciones.push({tipo, celdas, esHorizontal: true});
                columna += longitud - 1;
            }
        }
    }
    
    // Combinaciones verticales
    for (let columna = 0; columna < configuracion.columnas; columna++) {
        for (let fila = 0; fila < configuracion.filas - 2; fila++) {
            const tipo = estado.tablero[fila][columna].tipo;
            if (tipo && tipo === estado.tablero[fila+1][columna].tipo && tipo === estado.tablero[fila+2][columna].tipo) {
                let longitud = 3;
                while (fila + longitud < configuracion.filas && estado.tablero[fila+longitud][columna].tipo === tipo) {
                    longitud++;
                }
                
                const celdas = Array.from({length: longitud}, (_, i) => ({fila: fila + i, columna}));
                combinaciones.push({tipo, celdas, esHorizontal: false});
                fila += longitud - 1;
            }
        }
    }
    
    return combinaciones;
}

// Buscar patrones L o T para bolsas
function buscarPatronLoT(combinacion, todasCombinaciones) {
    if (combinacion.celdas.length !== 3) return null;
    
    for (const otraCombinacion of todasCombinaciones) {
        if (otraCombinacion === combinacion || otraCombinacion.celdas.length !== 3) continue;
        
        const interseccion = combinacion.celdas.find(c1 => 
            otraCombinacion.celdas.some(c2 => c1.fila === c2.fila && c1.columna === c2.columna));
        
        if (interseccion) return {posicion: interseccion, tipo: 'LoT'};
    }
    return null;
}

// Procesar combinaciones y crear elementos especiales VISIBLES
function procesarCombinaciones(combinaciones) {
    const elementosEspeciales = [];
    const celdasAEliminar = new Set();
    let creaPocionExp = false, pocionExpPosicion = null;
    let creaBolsa = false, bolsaPosicion = null;
    let creaFrascoH = false, frascoHPosicion = null;
    let creaFrascoV = false, frascoVPosicion = null;

    // Identificar combinaciones especiales
    for (const combinacion of combinaciones) {
        // En procesarCombinaciones():
        if (combinacion.celdas.length >= 5) {
            // Prioridad máxima a PocionExp
            if (!creaPocionExp) {
                creaPocionExp = true;
                pocionExpPosicion = combinacion.celdas[2]; // Posición central
            }
        } else if (combinacion.celdas.length === 4) {
            // Prioridad media a Frascos
            if (combinacion.esHorizontal && !creaFrascoH && !creaPocionExp) {
                creaFrascoH = true;
                frascoHPosicion = combinacion.celdas[1];
            } else if (!combinacion.esHorizontal && !creaFrascoV && !creaPocionExp) {
                creaFrascoV = true;
                frascoVPosicion = combinacion.celdas[1];
            }
        } else if (combinacion.celdas.length === 3) {
            // Prioridad baja a Bolsas (solo si no hay otros especiales)
            const patronLoT = buscarPatronLoT(combinacion, combinaciones);
            if (patronLoT && !creaBolsa && !creaPocionExp && !creaFrascoH && !creaFrascoV) {
                creaBolsa = true;
                bolsaPosicion = patronLoT.posicion;
            }
        }
        
        combinacion.celdas.forEach(celda => celdasAEliminar.add(`${celda.fila},${celda.columna}`));
        estado.puntuacion += combinacion.celdas.length * 10;
    }

    // Crear elementos especiales VISIBLES en el tablero
    if (creaPocionExp) {
        elementosEspeciales.push({...pocionExpPosicion, especial: 'PocionExp'});
    } else if (creaBolsa) {
        const tipo = estado.tablero[bolsaPosicion.fila][bolsaPosicion.columna].tipo;
        elementosEspeciales.push({
            ...bolsaPosicion,
            especial: 'Bolsa' + tipo
        });
    } else {
        if (creaFrascoH) {
            const tipo = estado.tablero[frascoHPosicion.fila][frascoHPosicion.columna].tipo;
            elementosEspeciales.push({
                ...frascoHPosicion,
                especial: 'FrascoH',
                tipo: tipo // Mantener el tipo original
            });
        }
        if (creaFrascoV) {
            const tipo = estado.tablero[frascoVPosicion.fila][frascoVPosicion.columna].tipo;
            elementosEspeciales.push({
                ...frascoVPosicion,
                especial: 'FrascoV',
                tipo: tipo // Mantener el tipo original
            });
        }
    }

    // Animación de eliminación
    animarEliminacion(celdasAEliminar, elementosEspeciales);
}

/* ---------------------------------------------------------------------------
 * ANIMAR ELIMINACIÓN — ahora actualiza los objetivos *antes* de vaciar celdas
 *---------------------------------------------------------------------------*/
function animarEliminacion(celdasAEliminar, elementosEspeciales) {
    // 1. Efecto visual preliminar
    celdasAEliminar.forEach(coord => {
        const [fila, columna] = coord.split(',').map(Number);
        const el = document.querySelector(`.celda[data-fila="${fila}"][data-columna="${columna}"] .elemento`);
        if (el) el.classList.add('eliminando');
    });

    setTimeout(() => {
        // 2. Descuenta los objetivos mientras las celdas aún conservan su tipo
        actualizarObjetivos(celdasAEliminar);

        // 3. Vacía las celdas eliminadas
        celdasAEliminar.forEach(coord => {
            const [fila, columna] = coord.split(',').map(Number);
            const celda = estado.tablero[fila][columna];
            celda.tipo = null;
            celda.especial = null;
        });

        // 4. Coloca los elementos especiales resultantes
        elementosEspeciales.forEach(e => {
            const celda = estado.tablero[e.fila][e.columna];
            celda.especial = e.especial;
            celda.tipo = e.tipo ??
                configuracion.tiposElementos[
                    Math.floor(Math.random() * configuracion.tiposElementos.length)
                ];
        });

        // 5. Rellena el tablero
        rellenarEspaciosVacios();
    }, 500);
}
// Manejar clic en elementos especiales
function manejarClic(fila, columna) {
    if (estado.bloqueado) return;
    
    const celda = estado.tablero[fila][columna];
    
    // Si no hay elemento seleccionado, seleccionar este
    if (estado.elementoSeleccionado === null) {
        estado.elementoSeleccionado = { fila, columna };
        resaltarCelda(fila, columna, true);
        return;
    }
    
    // Si ya hay elemento seleccionado, manejar intercambio
    const seleccionado = estado.elementoSeleccionado;
    const esAdyacente = (
        (Math.abs(seleccionado.fila - fila) === 1 && seleccionado.columna === columna) || 
        (Math.abs(seleccionado.columna - columna) === 1 && seleccionado.fila === fila
    ));
    
    if (esAdyacente) {
        estado.bloqueado = true;
        resaltarCelda(seleccionado.fila, seleccionado.columna, false);
        
        animarIntercambio(
            seleccionado.fila, seleccionado.columna,
            fila, columna,
            () => {
                estado.movimientos--;
                actualizarUI();
                
                // Verificar combinaciones especiales primero
                const combinacionEspecial = verificarCombinacionEspecial(
                    seleccionado.fila, seleccionado.columna,
                    fila, columna
                );
                
                if (combinacionEspecial) {
                    procesarCombinacionEspecial(combinacionEspecial);
                } else {
                    // Lógica normal de combinaciones
                    const combinaciones = buscarCombinaciones();
                    if (combinaciones.length === 0) {
                        // Revertir si no hay combinaciones
                        animarIntercambio(
                            fila, columna,
                            seleccionado.fila, seleccionado.columna,
                            () => {
                                estado.movimientos++;
                                actualizarUI();
                                estado.bloqueado = false;
                            }
                        );
                    } else {
                        procesarCombinaciones(combinaciones);
                    }
                }
            }
        );
    } else {
        // Si no es adyacente, cambiar selección
        resaltarCelda(seleccionado.fila, seleccionado.columna, false);
        estado.elementoSeleccionado = { fila, columna };
        resaltarCelda(fila, columna, true);
    }
}

// Activar Poción Explosiva
function activarPocionExp(fila, columna) {
    estado.bloqueado = true;
    const tipo = estado.tablero[fila][columna].tipo;
    const celdasExplosion = new Set();
    
    // Eliminar la poción
    celdasExplosion.add(`${fila},${columna}`);
    
    // Buscar todos los elementos del mismo tipo
    for (let f = 0; f < configuracion.filas; f++) {
        for (let c = 0; c < configuracion.columnas; c++) {
            if (estado.tablero[f][c].tipo === tipo) {
                celdasExplosion.add(`${f},${c}`);
                estado.puntuacion += 5;
            }
        }
    }
    
    animarExplosionEspecial(celdasExplosion, 'pocion');
}

// Activar Frasco Horizontal
function activarFrascoH(fila, columna) {
    estado.bloqueado = true;
    const celdasExplosion = new Set();
    
    // Eliminar el frasco
    celdasExplosion.add(`${fila},${columna}`);
    
    // Eliminar toda la fila
    for (let c = 0; c < configuracion.columnas; c++) {
        celdasExplosion.add(`${fila},${c}`);
        estado.puntuacion += 5;
    }
    
    animarExplosionEspecial(celdasExplosion, 'frasco-h');
}

// Activar Frasco Vertical
function activarFrascoV(fila, columna) {
    estado.bloqueado = true;
    const celdasExplosion = new Set();
    
    // Eliminar el frasco
    celdasExplosion.add(`${fila},${columna}`);
    
    // Eliminar toda la columna
    for (let f = 0; f < configuracion.filas; f++) {
        celdasExplosion.add(`${f},${columna}`);
        estado.puntuacion += 5;
    }
    
    animarExplosionEspecial(celdasExplosion, 'frasco-v');
}

// Activar Bolsa
function activarBolsa(fila, columna) {
    estado.bloqueado = true;
    const celdasExplosion1 = new Set();
    const celdasExplosion2 = new Set();
    
    // Primera explosión (solo la bolsa)
    celdasExplosion1.add(`${fila},${columna}`);
    
    // Segunda explosión (3x3) después de un retraso
    setTimeout(() => {
        for (let f = Math.max(0, fila - 1); f <= Math.min(configuracion.filas - 1, fila + 1); f++) {
            for (let c = Math.max(0, columna - 1); c <= Math.min(configuracion.columnas - 1, columna + 1); c++) {
                celdasExplosion2.add(`${f},${c}`);
                estado.puntuacion += 5;
            }
        }
        animarExplosionEspecial(celdasExplosion2, 'bolsa');
    }, 300);
    
    animarExplosionEspecial(celdasExplosion1, 'bolsa');
}

/* ---------------------------------------------------------------------------
 * ANIMAR EXPLOSIÓN ESPECIAL — misma idea: contar antes de borrar
 *---------------------------------------------------------------------------*/
function animarExplosionEspecial(celdasExplosion, tipoEfecto) {
    // 1. Efecto visual de explosión
    celdasExplosion.forEach(coord => {
        const [fila, columna] = coord.split(',').map(Number);
        const el = document.querySelector(`.celda[data-fila="${fila}"][data-columna="${columna}"] .elemento`);
        if (el) el.classList.add('explosion', tipoEfecto);
    });

    setTimeout(() => {
        // 2. Descuenta los objetivos
        actualizarObjetivos(celdasExplosion);

        // 3. Vacía las celdas afectadas
        celdasExplosion.forEach(coord => {
            const [fila, columna] = coord.split(',').map(Number);
            const celda = estado.tablero[fila][columna];
            celda.tipo = null;
            celda.especial = null;
        });

        // 4. Rellenar y desbloquear
        rellenarEspaciosVacios();
        estado.bloqueado = false;
    }, 500);
}

function actualizarObjetivos(celdasEliminadas) {
    // 1. Prepara el contador
    const contador = {};
    configuracion.tiposElementos.forEach(t => (contador[t] = 0));

    // 2. Cuenta eliminados (sin duplicados y solo tipos válidos)
    [...new Set(celdasEliminadas)].forEach(coord => {
        const [fila, col] = coord.split(',').map(Number);
        const celda = estado.tablero[fila]?.[col];
        if (celda && contador.hasOwnProperty(celda.tipo)) {
            contador[celda.tipo]++;
        }
    });

    // 3. Actualiza los objetivos
    estado.objetivos.forEach(obj => {
        const resta = contador[obj.tipo] ?? 0;
        obj.cantidad = Math.max(0, obj.cantidad - resta);
    });

    // 4. Refresca la UI
    document.querySelectorAll('.objetivo').forEach((el, i) => {
        const obj = estado.objetivos[i];
        const original = configuracion.niveles[estado.nivelActual].objetivos[i].cantidad;
        const completado = original - obj.cantidad;

        el.querySelector('.progreso').textContent = `${completado}/${original}`;

        if (obj.cantidad <= 0) {
            el.style.opacity = '0.6';
            el.style.textDecoration = 'line-through';
        } else {
            el.style.opacity = '1';
            el.style.textDecoration = 'none';
        }
    });

    // 5. ¿Nivel completado?
    if (estado.objetivos.every(o => o.cantidad <= 0)) {
        setTimeout(() => {
            if (estado.nivelActual + 1 < configuracion.niveles.length) {
                iniciarJuego(estado.nivelActual + 1);
            } else {
                alert('¡Felicidades! Has completado todos los niveles.');
                iniciarJuego(0);
            }
        }, 1000);
    }
}


// Function to check if a special combination exists between two cells
function verificarCombinacionEspecial(fila1, columna1, fila2, columna2) {
    // Get the two cells
    const celda1 = estado.tablero[fila1][columna1];
    const celda2 = estado.tablero[fila2][columna2];
    
    // Caso 1: Poción con cualquier elemento
    if (celda1.especial === 'PocionExp' || celda2.especial === 'PocionExp') {
        const pocion = celda1.especial === 'PocionExp' ? 
            {fila: fila1, col: columna1, tipo: celda2.tipo} : 
            {fila: fila2, col: columna2, tipo: celda1.tipo};
        return {tipo: 'pocion', ...pocion};
    }
    
    // Caso 2: Frasco con elemento del mismo tipo
    if ((celda1.especial?.startsWith('Frasco') && celda2.tipo === celda1.tipo) ||
        (celda2.especial?.startsWith('Frasco') && celda1.tipo === celda2.tipo)) {
        const frasco = celda1.especial?.startsWith('Frasco') ? 
            {fila: fila1, col: columna1, dir: celda1.especial.replace('Frasco', '')} : 
            {fila: fila2, col: columna2, dir: celda2.especial.replace('Frasco', '')};
        return {tipo: 'frasco', ...frasco};
    }
    
    // Caso 3: Dos frascos
    if (celda1.especial?.startsWith('Frasco') && celda2.especial?.startsWith('Frasco')) {
        return {
            tipo: 'doble-frasco',
            fila1, col1: columna1, dir1: celda1.especial.replace('Frasco', ''),
            fila2, col2: columna2, dir2: celda2.especial.replace('Frasco', '')
        };
    }
    
    // Caso 4: Bolsa con cualquier elemento
    if (celda1.especial?.startsWith('Bolsa') || celda2.especial?.startsWith('Bolsa')) {
        const bolsa = celda1.especial?.startsWith('Bolsa') ? 
            {fila: fila1, col: columna1} : 
            {fila: fila2, col: columna2};
        return {tipo: 'bolsa', ...bolsa};
    }
    
    return null;
}


function procesarCombinacionEspecial(combinacion) {
    const celdasAEliminar = new Set();
    let efectoEspecial = null;
    
    switch(combinacion.tipo) {
        case 'pocion':
            // Convertir todos los elementos del tipo en potiones
            for (let f = 0; f < configuracion.filas; f++) {
                for (let c = 0; c < configuracion.columnas; c++) {
                    if (estado.tablero[f][c].tipo === combinacion.tipo) {
                        estado.tablero[f][c] = {
                            tipo: combinacion.tipo,
                            especial: 'PocionExp'
                        };
                    }
                }
            }
            celdasAEliminar.add(`${combinacion.fila},${combinacion.col}`);
            break;
            
        case 'frasco':
            // Activar frasco en su dirección
            if (combinacion.dir === 'H') {
                for (let c = 0; c < configuracion.columnas; c++) {
                    celdasAEliminar.add(`${combinacion.fila},${c}`);
                }
            } else {
                for (let f = 0; f < configuracion.filas; f++) {
                    celdasAEliminar.add(`${f},${combinacion.col}`);
                }
            }
            break;
            
        case 'doble-frasco':
            // Crear cruz completa
            for (let c = 0; c < configuracion.columnas; c++) {
                celdasAEliminar.add(`${combinacion.fila1},${c}`);
            }
            for (let f = 0; f < configuracion.filas; f++) {
                celdasAEliminar.add(`${f},${combinacion.col2}`);
            }
            break;
            
        case 'bolsa':
            // Explosión en área 3x3
            for (let f = Math.max(0, combinacion.fila - 1); f <= Math.min(configuracion.filas - 1, combinacion.fila + 1); f++) {
                for (let c = Math.max(0, combinacion.col - 1); c <= Math.min(configuracion.columnas - 1, combinacion.col + 1); c++) {
                    celdasAEliminar.add(`${f},${c}`);
                }
            }
            break;
    }
    
    animarExplosionEspecial(celdasAEliminar, combinacion.tipo);
    actualizarObjetivos(celdasAEliminar);
    rellenarEspaciosVacios();
}

// Rellenar espacios vacíos
function rellenarEspaciosVacios() {
    let celdasRellenadas = 0;
    
    for (let columna = 0; columna < configuracion.columnas; columna++) {
        // Primero: Hacer caer los elementos existentes
        let espaciosVacios = 0;
        for (let fila = configuracion.filas - 1; fila >= 0; fila--) {
            if (estado.tablero[fila][columna].tipo === null) {
                espaciosVacios++;
            } else if (espaciosVacios > 0) {
                // Mover elemento hacia abajo
                estado.tablero[fila + espaciosVacios][columna] = {...estado.tablero[fila][columna]};
                estado.tablero[fila][columna] = {tipo: null, especial: null};
                celdasRellenadas++;
            }
        }
        
        // Segundo: Rellenar con nuevos elementos en la parte superior
        for (let fila = 0; fila < espaciosVacios; fila++) {
            estado.tablero[fila][columna] = {
                tipo: configuracion.tiposElementos[Math.floor(Math.random() * configuracion.tiposElementos.length)],
                especial: null
            };
            celdasRellenadas++;
        }
    }
    

    
    // Tercero: Redibujar y verificar combinaciones
    if (celdasRellenadas > 0) {
        dibujarTablero();
        
        setTimeout(() => {
            const nuevasCombinaciones = buscarCombinaciones();
            if (nuevasCombinaciones.length > 0) {
                procesarCombinaciones(nuevasCombinaciones);
            } else {
                estado.bloqueado = false;
                
                // Verificar fin del juego
                if (estado.movimientos <= 0 && !estado.objetivos.every(obj => obj.cantidad <= 0)) {
                    setTimeout(() => {
                        alert(`¡Se acabaron los movimientos! Puntuación: ${estado.puntuacion}`);
                        iniciarJuego(estado.nivelActual);
                    }, 500);
                }
            }
        }, 100); // Pequeño retraso para permitir que el navegador renderice
    } else {
        estado.bloqueado = false;
    }
}

// Actualizar la interfaz de usuario
function actualizarUI() {
    document.getElementById('puntuacion').textContent = estado.puntuacion;
    document.getElementById('movimientos').textContent = estado.movimientos;
}

// Reiniciar el juego
document.getElementById('boton-reiniciar').addEventListener('click', () => {
    iniciarJuego(estado.nivelActual);
});

// Iniciar el juego cuando se carga la página
window.addEventListener('DOMContentLoaded', () => iniciarJuego(0));