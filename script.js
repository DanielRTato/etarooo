// Función para verificar soporte de características
function verificarSoporte() {
    // Verificar soporte para Canvas
    if (!window.CanvasRenderingContext2D) {
        mostrarMensajeError('Tu navegador no soporta Canvas. Por favor, actualízalo o usa otro navegador.');
        return false;
    }

    // Verificar soporte para localStorage
    if (typeof(Storage) === "undefined") {
        mostrarMensajeError('Tu navegador no soporta almacenamiento local. Algunas funciones pueden no funcionar.');
    }

    // Verificar soporte para Promise
    if (!window.Promise) {
        mostrarMensajeError('Tu navegador no soporta Promises. Por favor, actualízalo o usa otro navegador.');
        return false;
    }

    return true;
}

// Función para mostrar mensajes de error
function mostrarMensajeError(mensaje) {
    const mensajeElement = document.createElement('div');
    mensajeElement.className = 'error-message';
    mensajeElement.textContent = mensaje;
    document.body.appendChild(mensajeElement);
}

// Función para mostrar mensajes de éxito
function mostrarMensajeExito(mensaje) {
    const mensajeElement = document.createElement('div');
    mensajeElement.className = 'success-message';
    mensajeElement.textContent = mensaje;
    document.body.appendChild(mensajeElement);

    // Eliminar el mensaje después de 3 segundos
    setTimeout(() => {
        mensajeElement.remove();
    }, 3000);
}

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    // Verificar soporte antes de inicializar
    if (!verificarSoporte()) {
        return;
    }

    // Efecto hover para los botones
    const botonesJuego = document.querySelectorAll('.boton-juego');
    
    botonesJuego.forEach(boton => {
        boton.addEventListener('mouseenter', () => {
            boton.style.transform = 'scale(1.1)';
        });
        
        boton.addEventListener('mouseleave', () => {
            boton.style.transform = 'scale(1)';
        });

        // Agregar soporte para dispositivos táctiles
        boton.addEventListener('touchstart', () => {
            boton.style.transform = 'scale(1.1)';
        });

        boton.addEventListener('touchend', () => {
            boton.style.transform = 'scale(1)';
        });
    });

    // Manejar errores de carga de imágenes
    const imagenes = document.querySelectorAll('img');
    imagenes.forEach(img => {
        img.onerror = () => {
            mostrarMensajeError(`No se pudo cargar la imagen: ${img.src}`);
            img.style.display = 'none';
        };
    });
});