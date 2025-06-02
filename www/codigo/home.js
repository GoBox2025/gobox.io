import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Contenedor donde se mostrarán los pedidos del usuario
const contenedorPedidos = document.getElementById("mis-pedidos");

// Función para mostrar los pedidos del usuario actual
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const pedidosRef = collection(db, "pedido1");
    const consulta = query(pedidosRef, where("usuarioId", "==", uid));

    try {
      const querySnapshot = await getDocs(consulta);

      if (querySnapshot.empty) {
        contenedorPedidos.innerHTML = "<p>No tienes pedidos publicados.</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const pedido = doc.data();

        const card = document.createElement("div");
        card.classList.add("pedido-card");
        card.innerHTML = `
          <img src="${pedido.imagen_url}" alt="Imagen del producto" class="imagen-pedido" />
          <h3>Producto: ${pedido.producto}</h3>
          <p><strong>Descripción:</strong> ${pedido.descripcion}</p>
          <p><strong>Estado:</strong> ${pedido.estado}</p>
          <p><strong>Fecha estimada:</strong> ${pedido.fecha_estimada}</p>
        `;

        contenedorPedidos.appendChild(card);
      });
    } catch (error) {
      console.error("Error al cargar los pedidos:", error);
      contenedorPedidos.innerHTML = "<p>Error al cargar tus pedidos.</p>";
    }
  } else {
    contenedorPedidos.innerHTML = "<p>Inicia sesión para ver tus pedidos.</p>";
  }
});
