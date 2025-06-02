// Importamos funciones para inicializar Firebase y usar Firestore y autenticación
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración con datos del proyecto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.firebasestorage.app",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializamos Firebase con la configuración y creamos referencias a Firestore y Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Obtenemos el elemento <tbody> dentro de la tabla para mostrar pedidos
const tabla = document.getElementById("tablaPedidos").getElementsByTagName("tbody")[0];

// URL para iniciar sesión en PayPal (se usa luego)
const paypalLoginUrl = "https://www.paypal.com/signin";

// Función para aceptar una oferta y actualizar estado del pedido en Firestore
async function aceptarOferta(notificacionId) {
    try {
        // Obtenemos la referencia al documento de la notificación
        const notiRef = doc(db, "notificaciones", notificacionId);
        // Obtenemos los datos de la notificación
        const notiSnap = await getDoc(notiRef);

        // Si la notificación no existe, mostramos alerta y salimos
        if (!notiSnap.exists()) {
            alert("No se encontró la notificación.");
            return;
        }

        // Obtenemos datos de la notificación
        const notiData = notiSnap.data();
        const pedidoId = notiData.pedidoId;

        // Si no hay ID del pedido, alertamos y salimos
        if (!pedidoId) {
            alert("No se encontró el ID del pedido asociado.");
            return;
        }

        // Obtenemos el ID o correo del viajero que hizo la oferta
        const viajeroId = notiData.viajeroId || notiData.correoViajero || null;

        // Si no se sabe quién hizo la oferta, alertamos y salimos
        if (!viajeroId) {
            alert("No se encontró quién hizo la oferta.");
            return;
        }

        // Actualizamos el documento del pedido: estado "Tomado" y quién lo tomó
        await updateDoc(doc(db, "pedido1", pedidoId), {
            estado: "Tomado",
            tomadoPorViajero: viajeroId
        });

        // Borramos la notificación porque ya aceptamos la oferta
        await deleteDoc(notiRef);

        // Avisamos que se aceptó y redirigimos a PayPal
        alert("¡Oferta aceptada correctamente!");
        window.location.href = paypalLoginUrl;

    } catch (error) {
        // Si hay error, lo mostramos en consola y alertamos
        console.error("Error al aceptar oferta:", error);
        alert("Ocurrió un error al aceptar la oferta.");
    }
}

// Función para mostrar un saludo personalizado al usuario que esté logueado
async function mostrarSaludo() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) return; // Si no hay usuario, no hacemos nada
        const uid = user.uid; // Obtenemos el ID del usuario actual
        // Buscamos en Firestore el usuario con ese uid
        const usuarios = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(usuarios);
        // Por cada usuario encontrado (solo uno debería haber)
        querySnapshot.docs.forEach((userDoc) => {
            const data = userDoc.data();
            // Cambiamos el texto del elemento con id "BienvenidaP"
            const saludo = document.getElementById("BienvenidaP");
            saludo.innerHTML = `Bienvenido ${data.nombre}, hoy es un gran día para que tu próximo paquete encuentre un destino.`;
        });
    });
}

// Función para mostrar pedidos y ofertas que tiene el usuario autenticado
async function mostrarPedido() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.error("No hay usuario autenticado.");
            return; // Si no hay usuario, no hacemos nada
        }

        const uid = user.uid; // Obtenemos el uid del usuario actual

        // Consultamos las notificaciones (ofertas) que tiene el usuario
        const notificacionesQuery = query(collection(db, "notificaciones"), where("propietarioId", "==", uid));
        // Obtenemos las notificaciones que ya mostramos antes para no repetir
        const notificacionesMostradas = new Set(JSON.parse(localStorage.getItem(`notificaciones_mostradas_${uid}`)) || []);

        // Escuchamos cambios en las notificaciones en tiempo real
        onSnapshot(notificacionesQuery, (snapshot) => {
            // Revisamos los cambios en cada documento
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") { // Solo si es nueva notificación
                    const docId = change.doc.id;
                    // Si ya mostramos esta notificación, no hacemos nada
                    if (notificacionesMostradas.has(docId)) return;

                    const data = change.doc.data();
                    // Mostramos un cuadro de confirmación con detalles de la oferta
                    const confirmar = confirm(
                        `¡Nueva oferta recibida!\nViajero: ${data.correoViajero || "Desconocido"}\nFecha entrega: ${data.fechaEntrega || "No especificada"}\nPrecio: $${data.precio || "0.00"}\n\n¿Quieres aceptarla ahora?`
                    );
                    // Si acepta, llamamos a la función para aceptar la oferta
                    if (confirmar) {
                        aceptarOferta(docId);
                    }

                    // Guardamos que ya mostramos esta notificación
                    notificacionesMostradas.add(docId);
                    localStorage.setItem(`notificaciones_mostradas_${uid}`, JSON.stringify([...notificacionesMostradas]));
                }
            });
        });

        // Consultamos los pedidos que hizo el usuario para mostrarlos
        const pedidosUsuario = query(collection(db, "pedido1"), where("usuarioId", "==", uid));
        const querySnapshot = await getDocs(pedidosUsuario);
        tabla.innerHTML = ""; // Limpiamos la tabla para llenarla de nuevo

        // Por cada pedido encontrado, creamos una fila en la tabla
        querySnapshot.docs.forEach((pedidoDoc) => {
            const data = pedidoDoc.data();
            const fila = tabla.insertRow(0); // Insertamos fila arriba
            fila.classList = 'fila';

            // Celda con la foto del pedido
            const celdaFoto = fila.insertCell(0);
            const img = document.createElement("img");
            img.src = data.imagen_url;
            img.alt = "Foto de pedido";
            img.style.width = "100px";
            img.style.height = "90px";
            img.style.borderRadius = "10px";
            celdaFoto.appendChild(img);

            // Celda con nombre, estado y fecha estimada
            const celda = document.createElement('td');
            celda.innerHTML = `
                Nombre: ${data.nombre}<br><br>
                Estado: ${data.estado}<br><br>
                Fecha de entrega: ${data.fecha_estimada}
            `;
            fila.appendChild(celda);

            // Celda para botones de detalles y eliminar
            const celdaBoton = fila.insertCell(2);
            celdaBoton.id = "celdaBotones";

            // Botón para ver detalles
            const button = document.createElement("button");
            // Botón para eliminar pedido
            const button2 = document.createElement("button");
            button.id = 'Detalles';
            button2.id = 'colordelete';

            // Función para eliminar pedido (se confirma antes)
            async function eliminarPedido(docId, fila, fila2) {
                let resultado = confirm("¿Está seguro de eliminar tu pedido?");
                if (!resultado) return;

                // Abrimos ventana a PayPal (no sé si es requisito)
                window.open("https://www.paypal.com", "paypalWindow", "width=600,height=700");

                try {
                    // Borramos el documento del pedido en Firestore
                    const docRef = doc(db, "pedido1", docId);
                    await deleteDoc(docRef);
                    // Quitamos la fila de la tabla
                    fila.remove();
                    if (fila2) fila2.remove();
                } catch (error) {
                    console.error("Error al eliminar pedido:", error);
                    alert("Ocurrió un error al borrar el pedido");
                }
            }

            // Evento para botón eliminar
            button2.addEventListener("click", () => {
                eliminarPedido(pedidoDoc.id, fila);
            });

            // Evento para botón detalles (redirecciona a página con detalles)
            button.addEventListener("click", () => {
                const pedidoId = pedidoDoc.id;
                window.location.href = `/www/detallesC.html?pedidoId=${pedidoId}`;
            });

            // Imagen flecha para botón detalles
            const imgButton = document.createElement("img");
            imgButton.id = 'arrow';
            imgButton.src = '/www/img/ArrowRight.png';

            // Imagen icono basura para botón eliminar
            const imgdelete = document.createElement("img");
            imgdelete.src = '/www/img/basura.png';
            imgdelete.style.height = "20px";
            imgdelete.id = 'Delete';

            // Añadimos imágenes a los botones
            button2.appendChild(imgdelete);
            button.appendChild(imgButton);
            // Añadimos botones a la celda de botones
            celdaBoton.appendChild(button);
            celdaBoton.appendChild(button2);

            // Creamos una fila extra para algo (no se ve qué hace, solo se crea)
            const fila2 = tabla.insertRow(0);
            fila2.id = 'fila2';
        });

        // Si no hay pedidos, mostramos mensaje e imagen
        if (querySnapshot.empty) {
            document.querySelector(".listPedidos").innerHTML = "<br><p>Aún no has realizado pedidos.</p>";
            const emptyBOX = document.querySelector(".listPedidos");
            const imgB = document.createElement("img");
            imgB.src = '/www/img/caja.png';
            imgB.id = 'Cajavacia';
            imgB.style.height = "130px";
            imgB.style.borderRadius = "10px";
            emptyBOX.appendChild(imgB);
        }
    });
}

// Función que llama a mostrar saludo y mostrar pedidos
function AllFunctions() {
    mostrarSaludo();
    mostrarPedido();
}

// Ejecutamos la función principal para iniciar todo al cargar la página
AllFunctions();
