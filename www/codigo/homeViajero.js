import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.firebasestorage.app",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const tabla = document.getElementById("tablaPedidos").getElementsByTagName("tbody")[0];
let pedidosCargados = false;


// === Mostrar saludo con nombre ===
async function mostrarSaludo() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const uid = user.uid;
    const usuarios = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshot = await getDocs(usuarios);

    querySnapshot.forEach((userDoc) => {
      const data = userDoc.data();
      const saludoElem = document.getElementById("BienvenidaP");

      saludoElem.innerHTML = `
        <p style="font-size: 25px; margin-bottom: 0.2em;">¡Bienvenido/a, ${data.nombre}!</p>
        <p style="font-size: 1em; margin: 0;">Cada viaje es una nueva oportunidad. Llena tu maleta con ganancias.</p>
       
      `;
    });
  });
}

// FUNCION DE PROXIMO VIAJE
// === Normalizar fecha ===
function getFechaString(fecha) {
  if (typeof fecha === "string") return fecha.replace(/\./g, "-").trim();
  if (fecha?.toDate) return fecha.toDate().toISOString().split("T")[0];
  return null;
}

// === Obtener viaje más próximo ===

function cargarProximoViaje() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.error(" No hay usuario autenticado.");
      return;
    }

    const usuarioUID = user.uid;
    console.log(" Usuario autenticado con UID:", usuarioUID);

    const viajesRef = collection(db, "Viajes");
    const q = query(viajesRef, where("usuarioId", "==", usuarioUID)); /* de esta forma se obtiene de la base de datos los viajes
                                                                         que le perteneces al usuari0*/

    try {
      const snapshot = await getDocs(q);
      const hoy = new Date();
      const viajesFuturos = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const fechaStr = getFechaString(data.fechaViaje);
        const fechaObj = new Date(fechaStr);

        if (!fechaStr || isNaN(fechaObj)) return;

        if (fechaObj >= hoy) {
          viajesFuturos.push({
            id: doc.id,
            ...data,
            fechaViaje: fechaStr,
            horaViaje: data.horaViaje || "00:00"
          });
        }
      });

      viajesFuturos.sort((a, b) => new Date(a.fechaViaje) - new Date(b.fechaViaje));
      mostrarViajeProximo(viajesFuturos[0] || null);
    } catch (err) {
      console.error(" no se pudo obtener el viaje:", err);
    }
  });
}
    

// === Mostrar próximo viaje ===
function mostrarViajeProximo(viaje) {
  const rutaElem = document.getElementById("viaje-ruta");
  const fechaElem = document.getElementById("viaje-fecha");

  if (!viaje) {
    rutaElem.textContent = "No hay viajes próximos.";
    fechaElem.textContent = "No hay fecha programada";
    
    return;
  }

  const origen = `${viaje.ubicacionOrigen || "?"}, ${viaje.paisOrigen || "?"}`;
  const destino = `${viaje.ubicacionDestino || "?"}, ${viaje.paisDestino || "?"}`;

  const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' };
  const fechaFormateada = new Date(viaje.fechaViaje).toLocaleDateString("es-ES", opcionesFecha);

  rutaElem.textContent = `Desde ${origen} a ${destino}`;
  fechaElem.textContent = `${fechaFormateada} a las ${viaje.horaViaje} horas E.S`;
}

document.addEventListener("DOMContentLoaded", cargarProximoViaje);



// Mostrar pedidos
async function mostrarPedidos() {
  onAuthStateChanged(auth, async (user) => {
    if (user && !pedidosCargados) {
      pedidosCargados = true;
      const querySnapshot = await getDocs(collection(db, "pedido1"));
      tabla.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fila = tabla.insertRow();
        fila.classList.add("fila-pedido");
        fila.setAttribute("data-nombre", data.nombre.toLowerCase());
        fila.setAttribute("data-id", doc.id);

        // Imagen
        const celdaFoto = fila.insertCell(0);
        const img = document.createElement("img");
        img.src = data.imagen_url || "/www/img/caja.png"
        img.alt = "Foto del producto";
        img.style.width = "100px";
        img.style.height = "85px";
        img.style.borderRadius = "10px";
        celdaFoto.appendChild(img);

        // Datos
        const celda = document.createElement("td");
        celda.innerHTML =
         `Nombre: ${data.nombre}
        <br><br>Estado: ${data.estado}<br>
        <br>Fecha de entrega: ${data.fecha_estimada}`;
        fila.appendChild(celda);

        // Botón
        const buttonCell = fila.insertCell(2);
        buttonCell.id = "celdaBotones";
        const button = document.createElement("button");
        button.id = 'Detalles2';
        button.style.height = "75px";
      
        button.addEventListener("click", () => {
          const pedidoId = doc.id;
          window.location.href = `detallesviajero.html?id=${pedidoId}`;
        });
             
        const imgButton = document.createElement("img");
        imgButton.id = 'arrow2';
        imgButton.src = 'img/ArrowRight.png';
        button.appendChild(imgButton);
        buttonCell.appendChild(button);

         const fila2 = tabla.insertRow();
            fila2.id = 'fila2';
            fila2.classList.add("fila-separadora");
            fila2.setAttribute("data-id", doc.id);
      });

      if (tabla.rows.length === 0) {
        
            //llamar el div para insertar el mensaje dentro de el. y poner el parrafo
            document.querySelector(".listPedidos").innerHTML = "<br><p>Aún no has realizado pedidos.</p>";

            //llamar el div otra vez para que en otra linea se inserte la imagen (solo por decoración)

            const emptyBOX = document.querySelector(".listPedidos");

            //se crea la imagen
            const imgB = document.createElement("img");

            //se le añade su dirección
            imgB.src = '/HomePageComprador/imagene/caja.png';

            //asigno id para modificarlo desde css
            imgB.id = 'Cajavacia';

            //se le modifican sus propiedades para esterilizar mejor :)


            imgB.style.height = "130px";

            imgB.style.borderRadius = "10px";

            //se inserta dentro del DIV
            emptyBOX.appendChild(imgB);

            console.log(querySnapshot.size);
      }
    } else if (!user) {
      document.querySelector(".listPedidos").innerHTML = "<p>Debes iniciar sesión para ver los pedidos.</p>";
    }
  });


  
}

// Filtro por nombre del producto
function agregarFiltroBusqueda() {
  const inputBusqueda = document.getElementById("busquedaProductos");
  inputBusqueda.addEventListener("input", () => {
    const filtro = inputBusqueda.value.toLowerCase();
    const filas = tabla.querySelectorAll(".fila-pedido");

    filas.forEach(fila => {
      const nombreProducto = fila.getAttribute("data-nombre") || "";
      const pedidoId = fila.getAttribute("data-id"); // Obtener el ID del pedido

      if (nombreProducto.includes(filtro)) {
        fila.style.display = ""; //  Muestra la fila del pedido
       
        //  Busca la fila2 
        const filaSeparadora = document.querySelector(`.fila-separadora[data-id="${pedidoId}"]`);
        if (filaSeparadora) {
          filaSeparadora.style.display = "";
        }
      } else {
        fila.style.display = "none"; 
        
        
        //  Oculta la fila separadora 
        const filaSeparadora = document.querySelector(`.fila-separadora[data-id="${pedidoId}"]`);
        if (filaSeparadora) {
          filaSeparadora.style.display = "none";
        }
      }
    });
  });
}
// Función de inicialización
function inicializar() {
  mostrarSaludo();
  mostrarPedidos();
  agregarFiltroBusqueda();
  cargarProximoViaje();

}

window.addEventListener("DOMContentLoaded", inicializar);
