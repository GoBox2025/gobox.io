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


// 6-13 ES LA LLAVE DE LA APP

const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.firebasestorage.app",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


//Obtener los elementos del DOM

const username = document.getElementById('username');
const useremail = document.getElementById('useremail');
const userphoto = document.getElementById('photo');
const userphone = document.getElementById('userphone');
const botonEdit = document.getElementById("change");
let select = document.getElementById("rolSelect");
let fechaNacimiento = document.getElementById("userFecha");
var SelectGender = document.getElementById("selectGenero");
let signOut = document.getElementById("logout");

//variables globales para obtener los valores de los option de los select 

let selectedValue = "";
let seleccion = "";


//cerrar sesión

const cerrarSesion = async () => {
    try {
        let confirmacion = confirm("¿Estas seguro de cerrar sesión?");

        if (confirmacion == "true") {
            await auth.signOut();
        }
        window.location.href = "login.html" //HELEN ACA VA A PONER LA DIRECCIÓN DE LA HOMEPAGE
        console.log("se cerro la sesión");
    } catch (error) {
        console.error("Error cerrando sesión:", error);
        // Manejar errores de forma adecuada (por ejemplo, mostrar un mensaje al usuario).
    }
};

signOut.addEventListener("click", cerrarSesion);

//función para mostrar usuarios

async function mostrarPerfil() {

    onAuthStateChanged(auth, async (user) => {

        //se obtiene el uid del usuario de la tabla pedidos1 y se verifia si ese uid esta autenticado

        if (!user) {
            console.error("No hay usuario autenticado.");
            return;
        }//fin de función

        const uid = user.uid;

        console.log("Usuario autenticado UID:", uid);

        // Consulta solo los pedidos del usuario autenticado y se verifica que el uid del usuario este dentro de la base de pedidos para asi saber cuantos ha hecho
        const pedidosUsuario = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(pedidosUsuario);
        console.log("Pedidos encontrados:", querySnapshot.size);

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            //mostrar nombre
            username.value = `${doc.data().nombre}`

            // mostrar correo
            useremail.innerHTML = `${doc.data().correo}`;

            //poner la foto

            const foto = document.createElement("img");

            //obtener la imagen desde la base de datos
            foto.src = `${doc.data().fotoURL}`;

            //estilo css
            foto.alt = "Foto de perfil";
            foto.style.width = "130px";
            foto.style.height = "130px";
            foto.style.borderRadius = "80px";
            userphoto.appendChild(foto);

            //agregar numero de telefono.

            userphone.value = `${doc.data().telefono}`;

            //Mostrar fecha de nacimiento

            fechaNacimiento.value = `${doc.data().FechaNacimiento}`;

            //Agregar el genero del usuario
            SelectGender.value =`${doc.data().Genero}`; 

            //se actualiza el valor por el que esta guardado en la base de datos el genero
            selectedValue = data.Genero || "Masculino";

             //Agregar el rol a HTML del usuario
            select.value = data.Rol || "Viajero";

             //se actualiza el valor por el que esta guardado en la base de datos el rol
            seleccion = data.Rol || "Viajero"; 



        });

    });

};//fin de la funcion para mostrar información



//función que permite cambiar de rol y pasar a la interfaz del viajero :)
function rolcambio() {

    var anuncio = confirm("esta seguro de cambiar a comprador y disfrutar de las mejores funcionalidades para pedir en GoBox?");

    if (anuncio == true) {
        window.location.href = "Home_viajero.html" /*hola helen, aca vas a poner la dirección para la home del comprador*/

    } else {
        return;
    }
};//fin


//obtener el valor cuando se selecciona el option para el genero del usuario
SelectGender.addEventListener("change", function () {

    selectedValue = this.value.toString();

    console.log("Valor seleccionado:", selectedValue);

    
});//fin de evento

//obtener el valor cuando se selecciona el option para el genero del rol
select.addEventListener("change", function () {
     seleccion = this.value;

   
  });//fin de evento



//creación de funciones para editar el perfil.

function habilitarInput() {

    console.log("Habilitando edición..."); 
    username.disabled = false;

    userphone.disabled = false;

    //preguntar por este error
    fechaNacimiento.disabled = false;

    SelectGender.disabled = false;

    select.disabled = false;

    botonEdit.textContent = "Guardar";

};//fin de función


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

    // Obtener el primer documento encontrado
    const userDoc = querySnapshot.docs[0]; // Acceder al primer resultado

    const userRef = doc(db, "users", userDoc.id);

    let fechaNacimientoValor = fechaNacimiento.value; // Obtener el valor actual del input de fecha

    let fecha = fechaNacimientoValor ? new Date(fechaNacimientoValor) : new Date("2000-01-01");

    let stringFecha = !isNaN(fecha.getTime()) ? fecha.toISOString().split("T")[0] : "2000-01-01";

    try {
        // Actualizar datos en Firestore
        await updateDoc(userRef, {

            nombre: username.value,

            telefono: userphone.value,

            FechaNacimiento: stringFecha,

            Genero: selectedValue,

            Rol: seleccion 
        });

        console.log("Perfil actualizado correctamente!");
        alert("tu perfil se edito correctamente");

        // Deshabilitar edición de inputs

        username.disabled = true;

        userphone.disabled = true;

        fechaNacimiento.disabled = true;

        SelectGender.disabled = true;

        select.disabled = true;

        botonEdit.textContent = "Editar";

         if (seleccion == "Comprador") { //Luz debes cambiar aca a "Comprador"
        rolcambio();
     };

    } catch (error) {

        console.error("Error al actualizar perfil:", error);
    }



    //aca poner la función para editar las cosas en la base de datos
};


//función para ejecutar la actualización del perfil
console.log("Texto inicial del botón:", botonEdit.textContent.trim());

//funcion para cambiar texto del boton de editar
function editarP() {
    if (botonEdit.textContent.trim() === "Editar") {
        habilitarInput();
    } else {
        Guardar();
    };
};


document.getElementById("change").addEventListener("click", editarP);
window.onload = mostrarPerfil;
