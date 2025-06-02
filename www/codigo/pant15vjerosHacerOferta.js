import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.appspot.com",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Función para crear la notificación
async function crearNotificacionOferta(oferta) {
    try {
        const notificacionData = {
            correoViajero: oferta.correo,
            fechaEntrega: oferta.fechaEntrega,
            precio: oferta.precio,
            pedidoId: oferta.pedidoId,
            propietarioId: oferta.propietarioId,
            fecha: new Date().toISOString(),
            leida: false
        };
        await addDoc(collection(db, "notificaciones"), notificacionData);
        console.log("Notificación creada para el comprador");
    } catch (error) {
        console.error("Error creando notificación:", error);
    }
}

// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const cancelButton = document.getElementById('bttnCancelarOferta');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener valores del formulario
        const fechaRetiro = document.getElementById('textFechaRetiroPaq').value;
        const fechaEntrega = document.getElementById('textFechaEntregaPaq').value;
        const precio = document.getElementById('textPrecioEntregarPaq').value;

        // Verificar usuario autenticado
        const user = auth.currentUser;
        if (!user) {
            alert('Debes iniciar sesión para hacer una oferta.');
            return;
        }

        const uid = user.uid;
        const nombre = user.displayName || "Nombre no disponible";
        const correo = user.email;

        // Obtener ID del pedido desde la URL
        const params = new URLSearchParams(window.location.search);
        const pedidoId = params.get('id');

        if (!pedidoId) {
            alert("No se encontró el ID del pedido.");
            return;
        }

        // Obtener el usuario que creó el pedido desde Firestore
        try {
            const pedidoRef = doc(db, "pedido1", pedidoId);
            const pedidoSnap = await getDoc(pedidoRef);

            if (!pedidoSnap.exists()) {
                alert("El pedido no existe.");
                return;
            }

            const propietarioId = pedidoSnap.data().usuarioId;

            // Crear objeto con datos de la oferta
            const ofertaData = {
                fechaRetiro,
                fechaEntrega,
                precio: parseFloat(precio),
                viajeroId: uid,
                nombre,
                correo,
                pedidoId,
                propietarioId,
                fecha_publicacion: new Date().toISOString()
            };

            // Guardar la oferta en Firestore
            const docRef = await addDoc(collection(db, "HacerOferta"), ofertaData);

            // Crear notificación para el comprador
            await crearNotificacionOferta(ofertaData);

            alert('¡Oferta publicada con éxito! ID: ' + docRef.id);
            form.reset();
            window.location.href = '/www/Home_viajero.html';
        } catch (error) {
            console.error("Error al publicar la oferta: ", error);
            alert('Error al publicar la oferta: ' + error.message);
        }
    });

    // Botón de cancelar
    cancelButton.addEventListener('click', () => {
        form.reset();
    });
});
