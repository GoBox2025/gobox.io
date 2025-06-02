import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:a1b2c3d4e5f67890",
  measurementId: "G-ABC1234ABC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

function mostrarNotificacionPush(mensaje) {
  const noti = document.getElementById("notificacion-push");
  if (!noti) return;
  noti.textContent = mensaje;
  noti.classList.remove("oculto");
  setTimeout(() => noti.classList.add("oculto"), 4000);
}

async function cargarOfertas() {
  if (!currentUser) {
    console.log("No hay usuario activo para cargar ofertas.");
    return;
  }

  console.log("Usuario detectado:", currentUser.uid);

  const ofertasRef = collection(db, "HacerOferta");
  const ofertasQuery = query(ofertasRef, where("propietarioId", "==", currentUser.uid));

  try {
    const ofertasSnap = await getDocs(ofertasQuery);
    const contenedor = document.getElementById("lista-pedidos");
    contenedor.innerHTML = "";

    if (ofertasSnap.empty) {
      contenedor.innerHTML = "<p>No tienes nuevas ofertas.</p>";
      return;
    }

    for (const ofertaDoc of ofertasSnap.docs) {
      const ofertaData = ofertaDoc.data();
      const pedidoId = ofertaData.pedidoId;

      const pedidoSnap = await getDoc(doc(db, "pedido1", pedidoId));
      if (pedidoSnap.exists()) {
        const pedidoData = pedidoSnap.data();

        mostrarNotificacionPush(`¡Tienes una nueva oferta para: ${pedidoData.producto}!`);

        const card = document.createElement("section");
        card.className = "card";
        card.innerHTML = `
          <div class="user-info">
            <img src="${pedidoData.imagen_url}" class="avatar" alt="Avatar"/>
            <span class="username">${pedidoData.nombre}</span>
          </div>
          <div class="order-info">
            <p><strong>Producto:</strong> ${pedidoData.producto}</p>
            <p><strong>Descripción:</strong> ${pedidoData.descripcion}</p>
            <p><strong>Cantidad:</strong> ${pedidoData.cantidad}</p>
            <p><strong>Peso:</strong> ${pedidoData.peso} kg</p>
            <p><strong>Desde:</strong> ${pedidoData.direccion_origen}</p>
            <p><strong>Hacia:</strong> ${pedidoData.direccion_destino}</p>
            <p><strong>Fecha estimada:</strong> ${pedidoData.fecha_estimada}</p>
            <p><strong>Costo:</strong> $${pedidoData.costo}</p>
          </div>
        `;
        contenedor.appendChild(card);
      }
    }
  } catch (error) {
    console.error("Error al cargar ofertas:", error);
    document.getElementById("lista-pedidos").innerHTML = "<p>Error al cargar las ofertas.</p>";
  }
}

// Sólo aquí escuchamos el estado de autenticación para llamar a cargarOfertas
onAuthStateChanged(auth, (user) => {
  currentUser = user ?? null;
  if (currentUser) {
    cargarOfertas();
  } else {
    const contenedor = document.getElementById("lista-pedidos");
    if (contenedor) contenedor.innerHTML = "<p>Debes iniciar sesión para ver tus notificaciones.</p>";
  }
});
