import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// Obtener el ID del pedido desde la URL
function getPedidoId() {
    const params = new URLSearchParams(window.location.search);
    const idPedido = params.get("id");
    console.log(" ID recibido en detallesviajero.html:", idPedido);
    return idPedido;
}

// Mostrar la información del pedido y configurar botón WhatsApp
async function mostrarPedido() {
  const idPedido = getPedidoId();
    if (!idPedido) {
        document.getElementById("pedido").textContent = "ID de pedido no especificado.";
        return;
    }

  const docRef = doc(db, "pedido1", idPedido);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    document.getElementById("pedido").textContent = "No se encontró el pedido.";
    return;
  }

  const data = docSnap.data();

  document.getElementById("costo").textContent = `Costo: ${data.costo || "No especificado"}`;
  document.getElementById("tipo").textContent = `Tipo: ${data.producto || "No especificado"}`;
  document.getElementById("tipoEntrega").textContent = `Tipo de entrega: ${data.entrega || "No especificado"}`;
  document.getElementById("entregarEn").textContent = `Entregar en: ${data.direccion_destino || "No especificado"}`;
  document.getElementById("recogerEn").textContent = `Recoger en: ${data.direccion_origen || "No especificado"}`;
  document.getElementById("peso").textContent = `Peso: ${data.peso || "No especificado"}`;
  document.getElementById("tipoDeEmpaquetado").textContent = `Tipo de empaquetado: ${data.empaquetado || "No especificado"}`;
  document.getElementById("imagen-pedido").src = data.imagen_url || "";
  document.getElementById("pedido").textContent = data.producto || "No especificado";
  document.getElementById("cantidad").textContent = `Cantidad: ${data.cantidad || "No especificado"}`;

  const compradorUID = data.usuarioId;
  
 
  // Buscar usuario en colección "users" por el campo "uid"
  const usersRef = collection(db, "users");
  const usersSnap = await getDocs(usersRef);
  let telefono = null;
  usersSnap.forEach(docUser => {
    const userData = docUser.data();
    if (userData.uid === compradorUID) {
      telefono = userData.telefono;
    }
  });

  if (!telefono) {
    console.log("No se encontró el usuario con UID:", compradorUID);
    return;
  }

  if (!telefono.startsWith("503")) {
    telefono = "503" + telefono;
  }

  const whatsappLink = `https://wa.me/${telefono}`;

  const boton = document.getElementById("botonWhatsApp");
  if (!boton) {
  console.error("No se encontró el botón de WhatsApp en el DOM.");
  return;
}
  if (boton) {
    boton.onclick = () => {
      window.open(whatsappLink, "_blank");
    };
  }
}

// Redirigir a hacer oferta con el ID del pedido
window.guardarCambios = function () {
  const pedidoId = getPedidoId();
  if (pedidoId) {
    window.location.href = `pant15vjerosHacerOferta.html?id=${pedidoId}`;
  } else {
    alert("No se encontró el ID del pedido.");
  }
};

window.onload = mostrarPedido;
