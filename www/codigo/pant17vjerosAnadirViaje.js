import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    getDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Llave Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.appspot.com",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 1. LÓGICA DE LOS SELECTORES
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos para los selectores de país
    document.getElementById('paisOrigen').addEventListener('change', function() {
        mostrarUbicacion('Origen', this.value);
    });
    
    document.getElementById('paisDestino').addEventListener('change', function() {
        mostrarUbicacion('Destino', this.value);
    });
    
    // Inicializar - ocultar todos los selectores condicionales
    document.querySelectorAll('.departamentosSV, .estadosUSA').forEach(function(element) {
        element.style.display = 'none';
    });
});

function mostrarUbicacion(tipo, pais) {
    const deptSV = document.getElementById(`departamentos${tipo}SV`);
    const estadosUSA = document.getElementById(`estados${tipo}USA`);
    
    deptSV.style.display = 'none';
    estadosUSA.style.display = 'none';
    
    if (pais === 'El Salvador') {
        deptSV.style.display = 'block';
    } else if (pais === 'Estados Unidos') {
        estadosUSA.style.display = 'block';
    }
}

// 2. LÓGICA PARA ENVIAR A FIRESTORE
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('anadirViaje');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener usuario actual
        const user = auth.currentUser;

        
        if (!user) {
            alert("Debes estar autenticado para registrar un viaje.");
            return;
        }
        
        // Obtener valores del formulario
        const paisOrigen = document.getElementById('paisOrigen').value;
        const paisDestino = document.getElementById('paisDestino').value;
        const fechaViaje = document.getElementById('fechaDeViaje').value;
        
        // Obtener ubicaciones específicas
        let ubicacionOrigen, ubicacionDestino;
        
        if (paisOrigen === 'El Salvador') {
            ubicacionOrigen = document.getElementById('departamentosOrigenSV').value;
        } else if (paisOrigen === 'Estados Unidos') {
            ubicacionOrigen = document.getElementById('estadosOrigenUSA').value;
        }
        
        if (paisDestino === 'El Salvador') {
            ubicacionDestino = document.getElementById('departamentosDestinoSV').value;
        } else if (paisDestino === 'Estados Unidos') {
            ubicacionDestino = document.getElementById('estadosDestinoUSA').value;
        }
        
        // Validaciones
        if (!paisOrigen || !paisDestino) {
            alert('Por favor selecciona países de origen y destino');
            return;
        }
        
        if (!ubicacionOrigen || !ubicacionDestino) {
            alert('Por favor selecciona una ubicación específica');
            return;
        }
        
        if (!fechaViaje) {
            alert('Por favor selecciona una fecha de viaje');
            return;
        }
        
        try {
            // Crear objeto con los datos del viaje
            const viajeData = {
                paisOrigen: paisOrigen,
                ubicacionOrigen: ubicacionOrigen,
                paisDestino: paisDestino,
                ubicacionDestino: ubicacionDestino,
                fechaViaje: fechaViaje,
                viajeroId: user.uid,
                nombre:user.displayName || "Usuario desconocido",
                correo:user.email ,
                fecha_publicacion:  new Date().toISOString()
            };
            
            // Enviar a Firestore
            const docRef = await addDoc(collection(db, "Viajes"), viajeData);
            
            alert('¡Viaje añadido con éxito!');
            form.reset();
            
            // Opcional: redirigir
            window.location.href = 'viajes.html';
            
        } catch (error) {
            console.error("Error al añadir el viaje: ", error);
            alert('Error al añadir el viaje: ' + error.message);
        }
    });
});