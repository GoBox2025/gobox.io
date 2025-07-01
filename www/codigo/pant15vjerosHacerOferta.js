import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración Firebase
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
}

// Esperar a que se cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("ofertaForm");
    const cancelarBtn = document.getElementById("bttnCancelarOferta");

    // Confirmar usuario autenticado antes de permitir enviar
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            alert("Debes iniciar sesión para hacer una oferta.");
            window.location.href = "login.html";
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const fechaRetiro = document.getElementById("textFechaRetiroPaq").value;
            const fechaEntrega = document.getElementById("textFechaEntregaPaq").value;
            const precio = parseFloat(document.getElementById("textPrecioEntregarPaq").value);

            if (!fechaRetiro || !fechaEntrega || isNaN(precio)) {
                alert("Por favor completa todos los campos correctamente.");
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const pedidoId = params.get("id");
            if (!pedidoId) {
                alert("No se encontró el ID del pedido.");
                return;
            }

            try {
                const pedidoRef = doc(db, "pedido1", pedidoId);
                const pedidoSnap = await getDoc(pedidoRef);

                if (!pedidoSnap.exists()) {
                    alert("El pedido no existe.");
                    return;
                }

                const propietarioId = pedidoSnap.data().usuarioId;
                const ofertaData = {
                    fechaRetiro,
                    fechaEntrega,
                    precio,
                    viajeroId: user.uid,
                    nombre: user.displayName || "Viajero sin nombre",
                    correo: user.email,
                    pedidoId,
                    propietarioId,
                    fecha_publicacion: new Date().toISOString()
                };

                await addDoc(collection(db, "HacerOferta"), ofertaData);
                await crearNotificacionOferta(ofertaData);
                await updateDoc(pedidoRef, { ofertado: true });

                alert("¡Oferta publicada con éxito!");
                form.reset();
                window.location.href = "Home_viajero.html";

            } catch (error) {
                console.error("Error al enviar oferta:", error);
                alert("Ocurrió un error al hacer la oferta.");
            }
        });

        // Botón cancelar
        cancelarBtn.addEventListener("click", () => {
            form.reset();
        // Enlace dinámico para regresar con el mismo ID de pedido
const params = new URLSearchParams(window.location.search);
const pedidoId = params.get("id");
if (pedidoId) {
  const volver = document.getElementById("linkVolver");
  volver.href = `detallesviajero.html?id=${pedidoId}`;
}

        });
    });
});
