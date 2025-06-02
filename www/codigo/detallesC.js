import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.appspot.com",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:a1b2c3d4e5f67890",
    measurementId: "G-ABC1234ABC"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Obtener el ID del pedido desde la URL
const urlParams = new URLSearchParams(window.location.search);
const pedidoId = urlParams.get('pedidoId');
console.log("ID del Pedido recibido:", pedidoId);
if (pedidoId) {
    const pedidoRef = doc(db, "pedido1", pedidoId);
    getDoc(pedidoRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
            const pedido = docSnapshot.data();  // Aquí estamos extrayendo los datos del pedido
            mostrarPedido(pedido);  // Llamamos a la función que muestra los datos
        } else {
            console.log("No se encontró el pedido.");
            alert("Este pedido no existe.");
        }
    }).catch((error) => {
        console.error("Error al obtener el pedido:", error);
        alert("Error al cargar el pedido.");
    });
} else {
    alert("No se ha proporcionado un ID de pedido.");
}

// Función para mostrar los detalles del pedido en los inputs
function mostrarPedido(pedido) {
    document.getElementById('nombre-pedido').value = pedido.nombre || 'No disponible';
    document.getElementById('producto-pedido').value = pedido.producto || 'No disponible';
    document.getElementById('cantidad-pedido').value = pedido.cantidad || 'No disponible';
    document.getElementById('peso-pedido').value = pedido.peso || 'No disponible';
    document.getElementById('empaquetado-pedido').value = pedido.empaquetado || 'No disponible';
    document.getElementById('direccion-origen-pedido').value = pedido.direccion_origen || 'No disponible';
    document.getElementById('direccion-destino-pedido').value = pedido.direccion_destino || 'No disponible';
    document.getElementById('descripcion-pedido').value = pedido.descripcion || 'No disponible';
    document.getElementById('costo-pedido').value = pedido.costo || '0';
    document.getElementById('fecha-estimada-pedido').value = pedido.fecha_estimada || 'No disponible';

    // Mostrar el estado en un p (no editable)
    const estadoPedido = document.getElementById('estado-pedido');
    estadoPedido.textContent = pedido.estado || 'No disponible';

    // Cargar la imagen desde el campo imagen_url
    const imagenPedido = document.getElementById('imagen-pedido');
    if (pedido.imagen_url) {
        imagenPedido.src = pedido.imagen_url;  // Usamos imagen_url
    } else {
        imagenPedido.alt = "Imagen no disponible";
    }
}

// Función para guardar los cambios en Firestore
document.getElementById('guardar-cambios').addEventListener('click', function () {
    const nombre = document.getElementById('nombre-pedido').value;
    const producto = document.getElementById('producto-pedido').value;
    const cantidad = document.getElementById('cantidad-pedido').value;
    const peso = document.getElementById('peso-pedido').value;
    const empaquetado = document.getElementById('empaquetado-pedido').value;
    const direccionOrigen = document.getElementById('direccion-origen-pedido').value;
    const direccionDestino = document.getElementById('direccion-destino-pedido').value;
    const descripcion = document.getElementById('descripcion-pedido').value;
    const costo = document.getElementById('costo-pedido').value;
    const fechaEstimada = document.getElementById('fecha-estimada-pedido').value;
    const estado = document.getElementById('estado-pedido').textContent; // No editable

    const pedidoRef = doc(db, "pedido1", pedidoId);

    // Si se seleccionó una nueva imagen, la subimos
    const inputImagen = document.getElementById('input-imagen');
    let nuevaImagenURL = null;
    if (inputImagen.files.length > 0) {
        const archivo = inputImagen.files[0];
        const imagenRef = ref(storage, 'images/' + archivo.name);
        const uploadTask = uploadBytesResumable(imagenRef, archivo);

        uploadTask.on('state_changed', (snapshot) => {
            // Opcional: ver el progreso de la subida
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Progreso de subida: ' + progress + '%');
        }, (error) => {
            console.log('Error al subir la imagen:', error);
            alert("Error al subir la imagen.");
        }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                nuevaImagenURL = downloadURL;
                console.log("Imagen subida correctamente, URL:", nuevaImagenURL);
                // Ahora actualizamos los datos
                actualizarPedido(pedidoRef, nombre, producto, cantidad, peso, empaquetado, direccionOrigen, direccionDestino, descripcion, costo, fechaEstimada, estado, nuevaImagenURL);
            });
        });
    } else {
        // Si no se seleccionó nueva imagen, actualizamos sin imagen
        actualizarPedido(pedidoRef, nombre, producto, cantidad, peso, empaquetado, direccionOrigen, direccionDestino, descripcion, costo, fechaEstimada, estado);
    }
});

// Función para actualizar el pedido en Firestore
function actualizarPedido(pedidoRef, nombre, producto, cantidad, peso, empaquetado, direccionOrigen, direccionDestino, descripcion, costo, fechaEstimada, estado, nuevaImagenURL) {
    const datosActualizados = {
        nombre,
        producto,
        cantidad,
        peso,
        empaquetado,
        direccion_origen: direccionOrigen,
        direccion_destino: direccionDestino,
        descripcion,
        costo,
        fecha_estimada: fechaEstimada,
        estado
    };

    if (nuevaImagenURL) {
        datosActualizados.imagen_url = nuevaImagenURL;  // Guardamos la URL con el campo imagen_url
    }

    updateDoc(pedidoRef, datosActualizados)
        .then(() => {
            // Mostrar mensaje de éxito
            alert("Pedido actualizado exitosamente");

            // Redirigir automáticamente a la página de detalles actualizada
            window.location.href = `detallesC.html?id=${pedidoId}`;  // Redirige a la página de detalles actualizada
        })
        .catch((error) => {
            console.error("Error al actualizar el pedido:", error);
            alert("Hubo un error al actualizar el pedido.");
        });
}
document.getElementById('marcar-entregado').addEventListener('click', async () => {
    if (!pedidoId) {
        alert("No se ha encontrado el ID del pedido.");
        return;
    }

    const pedidoRef = doc(db, "pedido1", pedidoId);

    try {
        await updateDoc(pedidoRef, {
            estado: "Entregado Exitosamente"
        });
        alert("El pedido ha sido marcado como entregado exitosamente.");
        document.getElementById('estado-pedido').textContent = "Entregado exitosamente";
    } catch (error) {
        console.error("Error al actualizar el estado del pedido:", error);
        alert("No se pudo actualizar el estado.");
    }
});

