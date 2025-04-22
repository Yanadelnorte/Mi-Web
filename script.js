document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Manejo del menú hamburguesa
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Inicializar array de clientes en localStorage si no existe
    if (!localStorage.getItem('clientes')) {
        localStorage.setItem('clientes', JSON.stringify([]));
    }

    // Manejo del formulario de clientes
    const clienteForm = document.getElementById('clienteForm');
    const clientesTable = document.getElementById('clientesTable');

    if (clienteForm) {
        clienteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(clienteForm);
            const clienteData = Object.fromEntries(formData.entries());
            
            clienteData.id = Date.now().toString();
            clienteData.mascotas = [];
            
            let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
            clientes.push(clienteData);
            localStorage.setItem('clientes', JSON.stringify(clientes));
            
            actualizarTablaClientes();
            clienteForm.reset();
            alert('Cliente registrado con éxito');
        });

        actualizarTablaClientes();
    }

    // Manejo del formulario de mascotas
    const mascotaForm = document.getElementById('mascotaForm');
    if (mascotaForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const clienteId = urlParams.get('clienteId');

        if (clienteId) {
            const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
            const cliente = clientes.find(c => c.id === clienteId);
            if (cliente) {
                const titulo = document.querySelector('h1');
                titulo.textContent = `Registrar Mascota para ${cliente.nombre} ${cliente.apellido}`;
            }
        }

        mascotaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const mascota = {
                nombre: document.getElementById('nombreMascota').value,
                fechaNacimiento: document.getElementById('fechaNacimientoMascota').value,
                color: document.getElementById('colorMascota').value,
                id: Date.now().toString()
            };

            if (clienteId) {
                const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
                const clienteIndex = clientes.findIndex(c => c.id === clienteId);
                
                if (clienteIndex !== -1) {
                    clientes[clienteIndex].mascotas.push(mascota);
                    localStorage.setItem('clientes', JSON.stringify(clientes));
                    
                    agregarMascotaATabla(mascota, clientes[clienteIndex].nombre + ' ' + clientes[clienteIndex].apellido);
                    mascotaForm.reset();
                    alert('Mascota registrada con éxito');
                }
            }
        });

        cargarMascotas(clienteId);
    }

    // Inicializar los filtros si estamos en la página de clientes
    if (document.getElementById('buscarApellido')) {
        setupFiltros();
    }
});

function actualizarTablaClientes() {
    if (!clientesTable) return;

    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const tbody = clientesTable.querySelector('tbody');
    tbody.innerHTML = '';

    clientes.forEach((cliente) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.nombre}</td>
            <td>${cliente.apellido}</td>
            <td>${cliente.dni}</td>
            <td>${cliente.fechaNacimiento}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.email}</td>
            <td>${cliente.mascotas.length > 0 ? 
                cliente.mascotas.map(mascota => mascota.nombre).join(', ') : 
                'Sin mascotas'}</td>
            <td>
                <button class="btn-agregar-mascota" onclick="window.location.href='mascotas.html?clienteId=${cliente.id}'">
                    Agregar Mascota
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function agregarMascotaATabla(mascota, nombreDueno) {
    const tabla = document.getElementById('mascotasTable').getElementsByTagName('tbody')[0];
    const row = tabla.insertRow();
    
    row.innerHTML = `
        <td>${mascota.nombre}</td>
        <td>${formatearFecha(mascota.fechaNacimiento)}</td>
        <td>${mascota.color}</td>
        <td>${nombreDueno || '-'}</td>
        <td>
            <button onclick="editarMascota('${mascota.id}')" class="btn-editar">Editar</button>
            <button onclick="eliminarMascota('${mascota.id}')" class="btn-eliminar">Eliminar</button>
        </td>
    `;
}

function cargarMascotas(clienteId) {
    const tabla = document.getElementById('mascotasTable').getElementsByTagName('tbody')[0];
    tabla.innerHTML = '';

    if (clienteId) {
        // Mostrar solo las mascotas del cliente seleccionado
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const cliente = clientes.find(c => c.id === clienteId);
        if (cliente) {
            cliente.mascotas.forEach(mascota => {
                agregarMascotaATabla(mascota, cliente.nombre + ' ' + cliente.apellido);
            });
        }
    } else {
        // Mostrar todas las mascotas
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        clientes.forEach(cliente => {
            cliente.mascotas.forEach(mascota => {
                agregarMascotaATabla(mascota, cliente.nombre + ' ' + cliente.apellido);
            });
        });
    }
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString();
}

function editarMascota(mascotaId) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    let mascotaEncontrada = null;
    let clienteEncontrado = null;

    // Buscar la mascota en todos los clientes
    clientes.forEach(cliente => {
        const mascota = cliente.mascotas.find(m => m.id === mascotaId);
        if (mascota) {
            mascotaEncontrada = mascota;
            clienteEncontrado = cliente;
        }
    });

    if (mascotaEncontrada) {
        document.getElementById('nombreMascota').value = mascotaEncontrada.nombre;
        document.getElementById('fechaNacimientoMascota').value = mascotaEncontrada.fechaNacimiento;
        document.getElementById('colorMascota').value = mascotaEncontrada.color;
        
        // Eliminar la mascota actual
        eliminarMascota(mascotaId);
    }
}

function eliminarMascota(mascotaId) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    
    clientes.forEach(cliente => {
        cliente.mascotas = cliente.mascotas.filter(m => m.id !== mascotaId);
    });

    localStorage.setItem('clientes', JSON.stringify(clientes));
    
    // Recargar la tabla
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('clienteId');
    cargarMascotas(clienteId);
}

// Función para filtrar la tabla de clientes
function setupFiltros() {
    const buscarApellido = document.getElementById('buscarApellido');
    const buscarDNI = document.getElementById('buscarDNI');
    const buscarMascota = document.getElementById('buscarMascota');

    // Función que maneja la búsqueda
    function filtrarTabla() {
        const apellidoFiltro = buscarApellido.value.toLowerCase();
        const dniFiltro = buscarDNI.value.toLowerCase();
        const mascotaFiltro = buscarMascota.value.toLowerCase();

        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const tbody = document.querySelector('#clientesTable tbody');
        tbody.innerHTML = '';

        clientes.forEach(cliente => {
            const coincideApellido = cliente.apellido.toLowerCase().includes(apellidoFiltro);
            const coincideDNI = cliente.dni.toLowerCase().includes(dniFiltro);
            const coincideMascota = cliente.mascotas.some(mascota => 
                mascota.nombre.toLowerCase().includes(mascotaFiltro)
            );

            // Mostrar el cliente si coincide con todos los filtros activos
            if ((!apellidoFiltro || coincideApellido) && 
                (!dniFiltro || coincideDNI) && 
                (!mascotaFiltro || coincideMascota)) {
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cliente.nombre}</td>
                    <td>${cliente.apellido}</td>
                    <td>${cliente.dni}</td>
                    <td>${cliente.fechaNacimiento}</td>
                    <td>${cliente.telefono}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.mascotas.map(m => m.nombre).join(', ') || 'Sin mascotas'}</td>
                    <td>
                        <button class="btn-agregar-mascota" onclick="window.location.href='mascotas.html?clienteId=${cliente.id}'">Agregar Mascota</button>
                        <button class="btn-editar">Editar</button>
                        <button class="btn-eliminar">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            }
        });
    }

    // Agregar event listeners para los campos de búsqueda
    buscarApellido.addEventListener('input', filtrarTabla);
    buscarDNI.addEventListener('input', filtrarTabla);
    buscarMascota.addEventListener('input', filtrarTabla);
}