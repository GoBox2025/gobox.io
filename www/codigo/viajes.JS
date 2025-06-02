import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let viajes = [];

async function cargarViajes(userId) {
    const viajesRef = collection(db, "Viajes");
    const snapshot = await getDocs(viajesRef);

    viajes = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(viaje => viaje.viajeroId === userId);  // ESto filtra porid del usuario actual (segun)

    mostrarViajes(viajes);
}

function mostrarViajes(lista) {
    const contenedor = document.querySelector(".lista-viaje");
    contenedor.innerHTML = "";

    lista.forEach((viaje) => {
        const div = document.createElement("div");
        div.className = "carta-viaje";
        div.innerHTML = `
            <h2>Viaje</h2>
            <h4>Origen: ${viaje.paisOrigen}, ${viaje.ubicacionOrigen}</h4>
            <h4>Destino: ${viaje.paisDestino}, ${viaje.ubicacionDestino}</h4>
            <p>Fecha de viaje: ${viaje.fechaViaje}</p>
            <button class="boton-borrar" onclick="borrarViaje('${viaje.id}')">
                <img src="img/basura.png" alt="Eliminar" class="icono-eliminar">
            </button>
        `;
        contenedor.appendChild(div);
    });
}
//funcion para borrar viaje 
async function borrarViaje(id) {
    const confirmado = confirm("¿Estás seguro de que deseas borrar este viaje?");
    if (confirmado) {
        await deleteDoc(doc(db, "Viajes", id));
        const user = auth.currentUser;
        if (user) cargarViajes(user.uid);
    }
}
//si la persona no a iniciado sección 
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            cargarViajes(user.uid);
        } else {
            alert("Por favor inicia sesión para ver tus viajes.");
            window.location.href = "login.html";
        }
    });
});