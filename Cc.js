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

// Crear el tablero con elementos aleatorios
function crearTablero() {
    estado.tablero = [];
    
    for (let fila = 0; fila < configuracion.filas; fila++) {
        estado.tablero[fila] = [];
        for (let columna = 0; columna < configuracion.columnas; columna++) {
            estado.tablero[fila][columna] = {
                tipo: obtenerElementoAleatorio(fila, columna),
                especial: null // Todos los elementos empiezan sin especial
            };
        }
    }
    
    // Asegurarnos de que no hay combinaciones al inicio
    while (buscarCombinaciones().length > 0) {
        rellenarEspaciosVacios();
    }
}

// Obtener un elemento aleatorio evitando combinaciones al inicio
function obtenerElementoAleatorio(fila, columna) {
    let elementosPosibles = [...configuracion.tiposElementos];
    
    // Eliminar elementos que podrían crear combinaciones horizontales
    if (columna >= 2) {
        const izquierda1 = estado.tablero[fila][columna-1]?.tipo;
        const izquierda2 = estado.tablero[fila][columna-2]?.tipo;
        
        if (izquierda1 && izquierda1 === izquierda2) {
            elementosPosibles = elementosPosibles.filter(e => e !== izquierda1);
        }
    }
    
    // Eliminar elementos que podrían crear combinaciones verticales
    if (fila >= 2) {
        const arriba1 = estado.tablero[fila-1][columna]?.tipo;
        const arriba2 = estado.tablero[fila-2][columna]?.tipo;
        
        if (arriba1 && arriba1 === arriba2) {
            elementosPosibles = elementosPosibles.filter(e => e !== arriba1);
        }
    }
    
    // Si no quedan elementos posibles, devolver cualquiera
    if (elementosPosibles.length === 0) {
        return configuracion.tiposElementos[Math.floor(Math.random() * configuracion.tiposElementos.length)];
    }
    
    return elementosPosibles[Math.floor(Math.random() * elementosPosibles.length)];
}

// Dibujar el tablero en el HTML
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
            let imagen;
            
            // Determinar la imagen a mostrar según el tipo y especial
            if (!celdaTablero.tipo) {
                // Celda vacía
                imagen = 'vacio.png'; // Asegúrate de tener una imagen para celdas vacías
            } else if (celdaTablero.especial) {
                // Manejo de elementos especiales
                if (celdaTablero.especial.includes('Frasco')) {
                    imagen = 'Frasco' + celdaTablero.tipo + 
                            (celdaTablero.especial === 'FrascoH' ? 'H' : 'V') + '.png';
                } else if (celdaTablero.especial === 'PocionExp') {
                    imagen = 'PocionExp.png';
                } else if (celdaTablero.especial.startsWith('Bolsa')) {
                    imagen = celdaTablero.especial + '.png';
                }
            } else {
                // Elemento normal
                imagen = celdaTablero.tipo + '.png';
            }
            
            // Aplicar la imagen al elemento
            elemento.style.backgroundImage = `url('../assets/imagenes/CC/${imagen}')`;
            celda.appendChild(elemento);
            
            // Añadir evento de clic
            celda.addEventListener('click', () => manejarClic(fila, columna));
            tableroHTML.appendChild(celda);
        }
    }
}
// Dibujar los objetivos en el panel
function dibujarObjetivos() {
    const container = document.getElementById('objetivos-container');
    container.innerHTML = '';
    
    estado.objetivos.forEach(objetivo => {
        const elementoObjetivo = document.createElement('div');
        elementoObjetivo.className = 'objetivo';
        
        elementoObjetivo.innerHTML = `
            <div class="icono" style="background-image: url('CC/${objetivo.tipo}.png')"></div>
            <div class="texto">Recolectar ${objetivo.cantidad} ${objetivo.tipo}s</div>
            <div class="progreso">0/${objetivo.cantidad}</div>
        `;
        
        container.appendChild(elementoObjetivo);
    });
}

// Manejar clic en una celda
function manejarClic(fila, columna) {
    // Si el juego está bloqueado (por animaciones en curso), no hacer nada
    if (estado.bloqueado) return;
    // Primera selección del jugador
    if (estado.elementoSeleccionado === null) {
        estado.elementoSeleccionado = { fila, columna };
        resaltarCelda(fila, columna, true); // Resalta la celda seleccionada
    // Segunda selección (intercambio)
    } else {
        const seleccionado = estado.elementoSeleccionado;
        // Verifica si la segunda selección es adyacente (horizontal o vertical)
        const esAdyacente = 
            (Math.abs(seleccionado.fila - fila) === 1 && seleccionado.columna === columna) ||
            (Math.abs(seleccionado.columna - columna) === 1 && seleccionado.fila === fila);
        
        if (esAdyacente) {
            estado.bloqueado = true; // Bloquea el tablero durante la animación
            resaltarCelda(seleccionado.fila, seleccionado.columna, false);  // Quita el resaltado
            // Anima el intercambio de las dos celdas
            animarIntercambio(
                seleccionado.fila, seleccionado.columna,
                fila, columna,
                () => {
                    estado.movimientos--;
                    actualizarUI();
                    // Busca combinaciones después del intercambio
                    const combinaciones = buscarCombinaciones();
                    if (combinaciones.length === 0) {
                        // Revertir si no hay combinaciones
                        animarIntercambio(
                            seleccionado.fila, seleccionado.columna,
                            fila, columna,
                            () => {
                                estado.movimientos++; // Devuelve el movimiento
                                actualizarUI();
                                estado.bloqueado = false;
                            }
                        );
                    } else {
                         // Si hay combinaciones válidas, las procesa
                        procesarCombinaciones(combinaciones);
                    }
                }
            );
        } else {
            // Si la segunda selección no es adyacente, simplemente quita el resaltado
            resaltarCelda(seleccionado.fila, seleccionado.columna, false);
        }
        // Restablece la selección
        estado.elementoSeleccionado = null;
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
    
    // Intercambiar visualmente
    elemento1.style.transition = 'transform 0.3s ease';
    elemento2.style.transition = 'transform 0.3s ease';
    
    // Calcular dirección del movimiento
    const dirX = columna2 - columna1;
    const dirY = fila2 - fila1;
    
    elemento1.style.transform = `translate(${dirX * 100}%, ${dirY * 100}%)`;
    elemento2.style.transform = `translate(${-dirX * 100}%, ${-dirY * 100}%)`;
    
    // Intercambiar en el tablero después de la animación
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
        
        // Actualizar imágenes
        const celdaTablero1 = estado.tablero[fila1][columna1];
        let imagen1 = celdaTablero1.tipo + '.png';
        if (celdaTablero1.especial) {
            if (celdaTablero1.especial.includes('Frasco')) {
                imagen1 = 'Frasco' + celdaTablero1.tipo + celdaTablero1.especial.slice(6) + '.png';
            } else if (celdaTablero1.especial === 'PocionExp') {
                imagen1 = 'PocionExp.png';
            }
        }
        elemento1.style.backgroundImage = `url('CC/${imagen1}')`;
        
        const celdaTablero2 = estado.tablero[fila2][columna2];
        let imagen2 = celdaTablero2.tipo + '.png';
        if (celdaTablero2.especial) {
            if (celdaTablero2.especial.includes('Frasco')) {
                imagen2 = 'Frasco' + celdaTablero2.tipo + celdaTablero2.especial.slice(6) + '.png';
            } else if (celdaTablero2.especial === 'PocionExp') {
                imagen2 = 'PocionExp.png';
            }
        }
        elemento2.style.backgroundImage = `url('CC/${imagen2}')`;
        
        if (callback) callback();
    }, 300);
}

// Buscar combinaciones en el tablero
function buscarCombinaciones() {
    const combinaciones = [];
    
    // Buscar combinaciones horizontales
    for (let fila = 0; fila < configuracion.filas; fila++) {
        for (let columna = 0; columna < configuracion.columnas - 2; columna++) {
            const tipo = estado.tablero[fila][columna].tipo;
            if (tipo && 
                tipo === estado.tablero[fila][columna+1].tipo && 
                tipo === estado.tablero[fila][columna+2].tipo) {
                
                let longitud = 3;
                while (columna + longitud < configuracion.columnas && 
                       estado.tablero[fila][columna+longitud].tipo === tipo) {
                    longitud++;
                }
                
                const celdas = [];
                for (let i = 0; i < longitud; i++) {
                    celdas.push({ fila, columna: columna + i });
                }
                
                combinaciones.push({
                    tipo,
                    celdas,
                    esHorizontal: true
                });
                
                columna += longitud - 1;
            }
        }
    }
    
    // Buscar combinaciones verticales
    for (let columna = 0; columna < configuracion.columnas; columna++) {
        for (let fila = 0; fila < configuracion.filas - 2; fila++) {
            const tipo = estado.tablero[fila][columna].tipo;
            if (tipo && 
                tipo === estado.tablero[fila+1][columna].tipo && 
                tipo === estado.tablero[fila+2][columna].tipo) {
                
                let longitud = 3;
                while (fila + longitud < configuracion.filas && 
                       estado.tablero[fila+longitud][columna].tipo === tipo) {
                    longitud++;
                }
                
                const celdas = [];
                for (let i = 0; i < longitud; i++) {
                    celdas.push({ fila: fila + i, columna });
                }
                
                combinaciones.push({
                    tipo,
                    celdas,
                    esHorizontal: false
                });
                
                fila += longitud - 1;
            }
        }
    }
    
    return combinaciones;
}

// Procesar combinaciones encontradas
function procesarCombinaciones(combinaciones) {
    const celdasAEliminar = new Set();
    const elementosEspeciales = [];
    let creaPocionExp = false;
    let pocionExpPosicion = null;
    let creaBolsa = false;
    let bolsaPosicion = null;

    // Primera pasada: buscar combinaciones especiales
    for (const combinacion of combinaciones) {
        if (combinacion.celdas.length >= 5 && !creaPocionExp) {
            creaPocionExp = true;
            const centro = Math.floor(combinacion.celdas.length / 2);
            pocionExpPosicion = combinacion.celdas[centro];
        } else if (combinacion.celdas.length === 4 && !creaBolsa) {
            creaBolsa = true;
            bolsaPosicion = combinacion.celdas[0]; // Usamos la primera celda
        }
    }

    // Segunda pasada: procesar todas las combinaciones
    for (const combinacion of combinaciones) {
        for (const celda of combinacion.celdas) {
            celdasAEliminar.add(`${celda.fila},${celda.columna}`);
            
            if (!creaPocionExp && !creaBolsa && combinacion.celdas.length >= 4) {
                const elemento = estado.tablero[celda.fila][celda.columna];
                if (!elemento.especial) {
                    elementosEspeciales.push({
                        fila: celda.fila,
                        columna: celda.columna,
                        especial: combinacion.esHorizontal ? 'FrascoH' : 'FrascoV'
                    });
                }
            }
        }
        
        estado.puntuacion += combinacion.celdas.length * 10;
    }

    // Crear elementos especiales si corresponde
    if (creaPocionExp && pocionExpPosicion) {
        elementosEspeciales.push({
            fila: pocionExpPosicion.fila,
            columna: pocionExpPosicion.columna,
            especial: 'PocionExp'
        });
    }
    
    if (creaBolsa && bolsaPosicion) {
        elementosEspeciales.push({
            fila: bolsaPosicion.fila,
            columna: bolsaPosicion.columna,
            especial: 'Bolsa' + estado.tablero[bolsaPosicion.fila][bolsaPosicion.columna].tipo
        });
    }

    animarEliminacion(celdasAEliminar, elementosEspeciales);
}

function animarEliminacion(celdasAEliminar, elementosEspeciales) {
    // Animación de eliminación
    for (const coordenada of celdasAEliminar) {
        const [fila, columna] = coordenada.split(',').map(Number);
        const celdaElemento = document.querySelector(`.celda[data-fila="${fila}"][data-columna="${columna}"] .elemento`);
        if (celdaElemento) {
            celdaElemento.classList.add('eliminando');
        }
    }
    
    setTimeout(() => {
        // Eliminar celdas marcadas
        for (const coordenada of celdasAEliminar) {
            const [fila, columna] = coordenada.split(',').map(Number);
            estado.tablero[fila][columna].tipo = null;
            // No eliminamos el especial aquí para que las bolsas persistan
        }
        
        // Aplicar elementos especiales
        for (const especial of elementosEspeciales) {
            const celda = estado.tablero[especial.fila][especial.columna];
            
            if (especial.especial.startsWith('Bolsa')) {
                // Para bolsas: mantener el tipo del elemento que formó la combinación
                celda.especial = especial.especial;
                celda.tipo = especial.tipo; // Guardamos el tipo original
            } else {
                // Para otros especiales (poción, frascos)
                celda.especial = especial.especial;
                celda.tipo = celda.tipo || 
                    configuracion.tiposElementos[Math.floor(Math.random() * configuracion.tiposElementos.length)];
            }
        }
        
        // Procesar efectos especiales inmediatos (poción explosiva)
        const pocionExp = elementosEspeciales.find(e => e.especial === 'PocionExp');
        if (pocionExp) {
            const tipo = estado.tablero[pocionExp.fila][pocionExp.columna].tipo;
            const celdasExplosion = new Set();
            
            for (let fila = 0; fila < configuracion.filas; fila++) {
                for (let columna = 0; columna < configuracion.columnas; columna++) {
                    if (estado.tablero[fila][columna].tipo === tipo) {
                        celdasExplosion.add(`${fila},${columna}`);
                        estado.puntuacion += 5;
                    }
                }
            }
            
            animarExplosion(celdasExplosion);
        } else {
            rellenarEspaciosVacios();
        }
        
        actualizarObjetivos(celdasAEliminar);
    }, 500);
}

function procesarCombinaciones(combinaciones) {
    const celdasAEliminar = new Set();
    const elementosEspeciales = [];
    let creaPocionExp = false;
    let pocionExpPosicion = null;
    let creaBolsa = false;
    let bolsaPosicion = null;
    let tipoBolsa = null;

    // Primera pasada: buscar combinaciones que generan especiales
    for (const combinacion of combinaciones) {
        if (combinacion.celdas.length >= 5 && !creaPocionExp) {
            creaPocionExp = true;
            const centro = Math.floor(combinacion.celdas.length / 2);
            pocionExpPosicion = combinacion.celdas[centro];
        } else if (combinacion.celdas.length === 4 && !creaBolsa) {
            creaBolsa = true;
            bolsaPosicion = combinacion.celdas[0];
            tipoBolsa = combinacion.tipo; // Tipo de la combinación que formó la bolsa
        }
    }

    // Segunda pasada: procesar todas las combinaciones
    for (const combinacion of combinaciones) {
        for (const celda of combinacion.celdas) {
            celdasAEliminar.add(`${celda.fila},${celda.columna}`);
            
            // Generar frascos si no hay otros especiales
            if (!creaPocionExp && !creaBolsa && combinacion.celdas.length >= 4) {
                const elemento = estado.tablero[celda.fila][celda.columna];
                if (!elemento.especial) {
                    elementosEspeciales.push({
                        fila: celda.fila,
                        columna: celda.columna,
                        especial: combinacion.esHorizontal ? 'FrascoH' : 'FrascoV',
                        tipo: combinacion.tipo
                    });
                }
            }
        }
        
        estado.puntuacion += combinacion.celdas.length * 10;
    }

    // Crear especiales si corresponde
    if (creaPocionExp && pocionExpPosicion) {
        elementosEspeciales.push({
            fila: pocionExpPosicion.fila,
            columna: pocionExpPosicion.columna,
            especial: 'PocionExp',
            tipo: estado.tablero[pocionExpPosicion.fila][pocionExpPosicion.columna].tipo
        });
    }
    
    if (creaBolsa && bolsaPosicion) {
        elementosEspeciales.push({
            fila: bolsaPosicion.fila,
            columna: bolsaPosicion.columna,
            especial: 'Bolsa' + tipoBolsa,
            tipo: tipoBolsa
        });
    }

    animarEliminacion(celdasAEliminar, elementosEspeciales);
}

// Función para manejar combinaciones con bolsas
function manejarCombinacionConBolsa(fila, columna) {
    const celda = estado.tablero[fila][columna];
    if (celda.especial && celda.especial.startsWith('Bolsa')) {
        const tipoBolsa = celda.especial.replace('Bolsa', '');
        const celdasAEliminar = new Set();
        
        // Eliminar todos los elementos del mismo tipo
        for (let f = 0; f < configuracion.filas; f++) {
            for (let c = 0; c < configuracion.columnas; c++) {
                if (estado.tablero[f][c].tipo === tipoBolsa) {
                    celdasAEliminar.add(`${f},${c}`);
                    estado.puntuacion += 5;
                }
            }
        }
        
        // Eliminar la bolsa también
        celdasAEliminar.add(`${fila},${columna}`);
        
        animarExplosion(celdasAEliminar);
        return true;
    }
    return false;
}

// Modificar la función manejarClic para soportar bolsas
function manejarClic(fila, columna) {
    if (estado.bloqueado) return;
    
    // Primero verificar si estamos haciendo clic en una bolsa
    if (estado.elementoSeleccionado === null) {
        if (manejarCombinacionConBolsa(fila, columna)) {
            return;
        }
        estado.elementoSeleccionado = { fila, columna };
        resaltarCelda(fila, columna, true);
    } else {
        const seleccionado = estado.elementoSeleccionado;
        const esAdyacente = 
            (Math.abs(seleccionado.fila - fila) === 1 && seleccionado.columna === columna) ||
            (Math.abs(seleccionado.columna - columna) === 1 && seleccionado.fila === fila);
        
        if (esAdyacente) {
            estado.bloqueado = true;
            resaltarCelda(seleccionado.fila, seleccionado.columna, false);
            
            // Verificar si estamos intercambiando con una bolsa
            if (manejarCombinacionConBolsa(fila, columna) || 
                manejarCombinacionConBolsa(seleccionado.fila, seleccionado.columna)) {
                estado.elementoSeleccionado = null;
                return;
            }
            
            animarIntercambio(
                seleccionado.fila, seleccionado.columna,
                fila, columna,
                () => {
                    estado.movimientos--;
                    actualizarUI();
                    const combinaciones = buscarCombinaciones();
                    if (combinaciones.length === 0) {
                        animarIntercambio(
                            seleccionado.fila, seleccionado.columna,
                            fila, columna,
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
            );
        } else {
            resaltarCelda(seleccionado.fila, seleccionado.columna, false);
        }
        estado.elementoSeleccionado = null;
    }
}
// Actualizar objetivos cuando se eliminan elementos
function actualizarObjetivos(celdasEliminadas) {
    for (const coordenada of celdasEliminadas) {
        const [fila, columna] = coordenada.split(',').map(Number);
        const tipoElemento = estado.tablero[fila][columna].tipo;
        
        if (tipoElemento) {
            const objetivo = estado.objetivos.find(obj => obj.tipo === tipoElemento);
            if (objetivo && objetivo.cantidad > 0) {
                objetivo.cantidad--;
                if (objetivo.cantidad < 0) objetivo.cantidad = 0;
            }
        }
    }
    
    // Actualizar visualización de objetivos
    const objetivosElements = document.querySelectorAll('.objetivo');
    estado.objetivos.forEach((objetivo, index) => {
        if (objetivosElements[index]) {
            const progreso = objetivosElements[index].querySelector('.progreso');
            const cantidadOriginal = configuracion.niveles[estado.nivelActual].objetivos[index].cantidad;
            const completado = cantidadOriginal - objetivo.cantidad;
            progreso.textContent = `${completado}/${cantidadOriginal}`;
            
            if (objetivo.cantidad <= 0) {
                objetivosElements[index].style.opacity = '0.6';
                objetivosElements[index].style.textDecoration = 'line-through';
            }
        }
    });
    
    // Verificar si se completaron todos los objetivos
    if (estado.objetivos.every(obj => obj.cantidad <= 0)) {
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

// Rellenar espacios vacíos en el tablero
function rellenarEspaciosVacios() {
    let celdasRellenadas = 0;
    
    for (let columna = 0; columna < configuracion.columnas; columna++) {
        let espaciosVacios = 0;
        
        // Contar espacios vacíos desde abajo hacia arriba
        for (let fila = configuracion.filas - 1; fila >= 0; fila--) {
            if (estado.tablero[fila][columna].tipo === null) {
                espaciosVacios++;
            } else if (espaciosVacios > 0) {
                // Mover elemento hacia abajo
                estado.tablero[fila + espaciosVacios][columna] = {...estado.tablero[fila][columna]};
                estado.tablero[fila][columna].tipo = null;
                animarCaida(fila, columna, fila + espaciosVacios, columna);
                celdasRellenadas++;
            }
        }
        
        // Rellenar espacios vacíos en la parte superior con nuevos elementos
        for (let fila = 0; fila < espaciosVacios; fila++) {
            estado.tablero[fila][columna] = {
                tipo: configuracion.tiposElementos[Math.floor(Math.random() * configuracion.tiposElementos.length)],
                especial: null
            };
            animarNuevoElemento(fila, columna);
            celdasRellenadas++;
        }
    }
    
    // Redibujar el tablero después de las animaciones
    if (celdasRellenadas > 0) {
        setTimeout(() => {
            dibujarTablero();
            
            // Verificar nuevas combinaciones después de rellenar
            const nuevasCombinaciones = buscarCombinaciones();
            if (nuevasCombinaciones.length > 0) {
                procesarCombinaciones(nuevasCombinaciones);
            } else {
                estado.bloqueado = false;
                
                // Verificar si el juego ha terminado
                if (estado.movimientos <= 0 && !estado.objetivos.every(obj => obj.cantidad <= 0)) {
                    setTimeout(() => {
                        alert(`¡Se acabaron los movimientos! Puntuación: ${estado.puntuacion}`);
                        iniciarJuego(estado.nivelActual);
                    }, 500);
                }
            }
        }, 500);
    } else {
        estado.bloqueado = false;
    }
}

// Rellenar espacios vacíos en el tablero (versión simplificada)
function rellenarEspaciosVacios() {
    let celdasRellenadas = 0;
    
    for (let columna = 0; columna < configuracion.columnas; columna++) {
        let espaciosVacios = 0;
        
        // Contar espacios vacíos desde abajo hacia arriba
        for (let fila = configuracion.filas - 1; fila >= 0; fila--) {
            if (estado.tablero[fila][columna].tipo === null) {
                espaciosVacios++;
            } else if (espaciosVacios > 0) {
                // Mover elemento hacia abajo
                estado.tablero[fila + espaciosVacios][columna] = {...estado.tablero[fila][columna]};
                estado.tablero[fila][columna].tipo = null;
                celdasRellenadas++;
            }
        }
        
        // Rellenar espacios vacíos en la parte superior con nuevos elementos
        for (let fila = 0; fila < espaciosVacios; fila++) {
            estado.tablero[fila][columna] = {
                tipo: configuracion.tiposElementos[Math.floor(Math.random() * configuracion.tiposElementos.length)],
                especial: null
            };
            celdasRellenadas++;
        }
    }
    
    // Redibujar el tablero inmediatamente
    if (celdasRellenadas > 0) {
        dibujarTablero();
        
        // Verificar nuevas combinaciones después de rellenar
        const nuevasCombinaciones = buscarCombinaciones();
        if (nuevasCombinaciones.length > 0) {
            procesarCombinaciones(nuevasCombinaciones);
        } else {
            estado.bloqueado = false;
            
            // Verificar si el juego ha terminado
            if (estado.movimientos <= 0 && !estado.objetivos.every(obj => obj.cantidad <= 0)) {
                setTimeout(() => {
                    alert(`¡Se acabaron los movimientos! Puntuación: ${estado.puntuacion}`);
                    iniciarJuego(estado.nivelActual);
                }, 500);
            }
        }
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
window.onload = () => iniciarJuego(0);