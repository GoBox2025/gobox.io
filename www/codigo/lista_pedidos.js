import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  databaseURL: "https://goboxprueba-default-rtdb.firebaseio.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let uidActual = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
  uidActual = user.email;
    cargarPedidos(); // Cargar los pedidos del viajero actual
  } else {
    alert("Debes iniciar sesión para ver tus pedidos.");
    window.location.href = "/www/login.html";
  }
});

async function cargarPedidos(estadoFiltro = "todos") {
  const container = document.querySelector(".orders");
  container.innerHTML = "";

  const template = document.getElementById("pedido-template");
  const querySnapshot = await getDocs(collection(db, "pedido1"));

  querySnapshot.forEach((doc) => {
    const pedido = doc.data();

    // Revisar si tomadoPorViajero existe y es igual al UID actual
    if (
      pedido.tomadoPorViajero === uidActual &&
      (estadoFiltro === "todos" || pedido.estado === estadoFiltro)
    ) {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".order-card");
      card.dataset.status = pedido.estado;

      const imagen = pedido.imagen_url || "/www/img/caja.png";
      clone.querySelector(".product-img").src = imagen;
      clone.querySelector(".pedido-nombre").textContent = pedido.nombre;
      clone.querySelector(".pedido-estado").textContent = "Estado: " + pedido.estado;
      clone.querySelector(".pedido-fecha").textContent = "Fecha de entrega: " + pedido.fecha_estimada;
      clone.querySelector(".detalle-btn").onclick = () => verDetalle(doc.id);

      container.appendChild(clone);
    }
  });
}

document.getElementById("filter-select").addEventListener("change", function () {
  const estadoSeleccionado = this.value;
  cargarPedidos(estadoSeleccionado);
});

window.verDetalle = function (pedidoId) {
  window.location.href = `DetallesParaLista.html?id=${pedidoId}`;
};
