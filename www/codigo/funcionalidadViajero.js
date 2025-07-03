// Importaciones de Firebase necesarias para inicializar la app, acceder a Firestore y autenticación
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.firebasestorage.app",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializa la app de Firebase, Firestore y Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Referencias a elementos HTML del DOM
const username = document.getElementById('username');
const useremail = document.getElementById('useremail');
const userphoto = document.getElementById('photo');
const userphone = document.getElementById('userphone');
const botonEdit = document.getElementById("change");
let select = document.getElementById("rolSelect");
let fechaNacimiento = document.getElementById("userFecha");
var SelectGender = document.getElementById("selectGenero");
let signOut = document.getElementById("logout");

// Variables para almacenar valores seleccionados de los <select>
let selectedValue = "";
let seleccion = "";

// Función para cerrar sesión
const cerrarSesion = async () => {
    try {
        let confirmacion = confirm("¿Estas seguro de cerrar sesión?");
        if (confirmacion == "true") {
            await auth.signOut();
        }
        window.location.href = "login.html";
        console.log("se cerró la sesión");
    } catch (error) {
        console.error("Error cerrando sesión:", error);
    }
};

// Asignar el evento de cierre de sesión al botón
signOut.addEventListener("click", cerrarSesion);

// Función que muestra el perfil del usuario autenticado
async function mostrarPerfil() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.error("No hay usuario autenticado.");
            return;
        }

        const uid = user.uid;
        console.log("Usuario autenticado UID:", uid);

        // Consultar la colección "users" filtrando por uid
        const pedidosUsuario = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(pedidosUsuario);
        console.log("Pedidos encontrados:", querySnapshot.size);

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Mostrar nombre
            username.value = `${data.nombre}`;

            // Mostrar correo
            useremail.innerHTML = `${data.correo}`;

            // Mostrar foto
            const foto = document.createElement("img");
            foto.src = `${data.fotoURL}`;
            foto.alt = "Foto de perfil";
            foto.style.width = "130px";
            foto.style.height = "130px";
            foto.style.borderRadius = "80px";
            userphoto.appendChild(foto);

            // Mostrar número de teléfono
            userphone.value = `${data.telefono}`;

            // Mostrar fecha de nacimiento
            fechaNacimiento.value = `${data.FechaNacimiento}`;

            // Mostrar género
            SelectGender.value = `${data.Genero}`;
            selectedValue = data.Genero || "Masculino";

            // Mostrar rol
            select.value = data.Rol || "Viajero";
            seleccion = data.Rol || "Viajero";
        });
    });
} // Fin de mostrarPerfil

// Función que cambia de rol al comprador (redirige de viajero a comprador)
function rolcambio() {
    var anuncio = confirm("¿Está seguro de cambiar a comprador y disfrutar de las mejores funcionalidades para pedir en GoBox?");
    if (anuncio == true) {
        window.location.href = "Home_comprador.html";
    } else {
        return;
    }
}

// Obtener el valor del select de género cuando cambia
SelectGender.addEventListener("change", function () {
    selectedValue = this.value.toString();
    console.log("Valor seleccionado:", selectedValue);
});

// Obtener el valor del select de rol cuando cambia
select.addEventListener("change", function () {
    seleccion = this.value;
});

// Habilita los campos para editar el perfil
function habilitarInput() {
    console.log("Habilitando edición...");
    username.disabled = false;
    userphone.disabled = false;
    fechaNacimiento.disabled = false;
    SelectGender.disabled = false;
    select.disabled = false;
    botonEdit.textContent = "Guardar";
}

// Función que guarda los cambios realizados en el perfil
async function Guardar() {
    const user = auth.currentUser;
    const uid = user.uid;

    const userQuery = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
        console.error("No se encontró el usuario en Firestore.");
        alert("No se encontró tu perfil en la base de datos.");
        return;
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, "users", userDoc.id);

    let fechaNacimientoValor = fechaNacimiento.value;
    let fecha = fechaNacimientoValor ? new Date(fechaNacimientoValor) : new Date("2000-01-01");
    let stringFecha = !isNaN(fecha.getTime()) ? fecha.toISOString().split("T")[0] : "2000-01-01";

    try {
        await updateDoc(userRef, {
            nombre: username.value,
            telefono: userphone.value,
            FechaNacimiento: stringFecha,
            Genero: selectedValue,
            Rol: seleccion
        });

        console.log("Perfil actualizado correctamente!");
        alert("Tu perfil se editó correctamente");

        // Deshabilitar inputs después de guardar
        username.disabled = true;
        userphone.disabled = true;
        fechaNacimiento.disabled = true;
        SelectGender.disabled = true;
        select.disabled = true;
        botonEdit.textContent = "Editar";

        if (seleccion == "Comprador") {
            rolcambio();
        }
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
    }
}

// Controla el botón que alterna entre modo "Editar" y "Guardar"
function editarP() {
    if (botonEdit.textContent.trim() === "Editar") {
        habilitarInput();
    } else {
        Guardar();
    }
}

// Asignar evento al botón de edición
document.getElementById("change").addEventListener("click", editarP);

// Ejecutar la función que carga el perfil al cargar la página
window.onload = mostrarPerfil;
