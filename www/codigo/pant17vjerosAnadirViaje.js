import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("anadirViaje");

  const selects = {
    departamentosOrigenSV: document.getElementById("departamentosOrigenSV"),
    estadosOrigenUSA: document.getElementById("estadosOrigenUSA"),
    departamentosDestinoSV: document.getElementById("departamentosDestinoSV"),
    estadosDestinoUSA: document.getElementById("estadosDestinoUSA"),
  };

  function mostrarUbicacion(tipo, pais) {
    if (tipo === "Origen") {
      selects.departamentosOrigenSV.style.display = "none";
      selects.estadosOrigenUSA.style.display = "none";

      if (pais === "El Salvador") selects.departamentosOrigenSV.style.display = "block";
      else if (pais === "Estados Unidos") selects.estadosOrigenUSA.style.display = "block";
    }

    if (tipo === "Destino") {
      selects.departamentosDestinoSV.style.display = "none";
      selects.estadosDestinoUSA.style.display = "none";

      if (pais === "El Salvador") selects.departamentosDestinoSV.style.display = "block";
      else if (pais === "Estados Unidos") selects.estadosDestinoUSA.style.display = "block";
    }
  }

  document.getElementById("paisOrigen").addEventListener("change", (e) => {
    mostrarUbicacion("Origen", e.target.value);
  });

  document.getElementById("paisDestino").addEventListener("change", (e) => {
    mostrarUbicacion("Destino", e.target.value);
  });

  let currentUser = null;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
    } else {
      alert("Debes iniciar sesión para registrar un viaje.");
      window.location.href = "login.html";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const paisOrigen = document.getElementById("paisOrigen").value;
    const paisDestino = document.getElementById("paisDestino").value;
    const fechaViaje = document.getElementById("fechaDeViaje").value;

    let ubicacionOrigen = paisOrigen === "El Salvador"
      ? selects.departamentosOrigenSV.value
      : selects.estadosOrigenUSA.value;

    let ubicacionDestino = paisDestino === "El Salvador"
      ? selects.departamentosDestinoSV.value
      : selects.estadosDestinoUSA.value;

    if (!paisOrigen || !paisDestino || !ubicacionOrigen || !ubicacionDestino || !fechaViaje) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const viajeData = {
      paisOrigen,
      ubicacionOrigen,
      paisDestino,
      ubicacionDestino,
      fechaViaje,
      viajeroId: currentUser.uid,
      nombre: currentUser.displayName || "Usuario desconocido",
      correo: currentUser.email,
      fecha_publicacion: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "Viajes"), viajeData);
      alert("¡Viaje añadido con éxito!");
      form.reset();
      window.location.href = "viajes.html";
    } catch (error) {
      console.error("Error al añadir el viaje: ", error);
      alert("Error al añadir el viaje: " + error.message);
    }
  });
});
