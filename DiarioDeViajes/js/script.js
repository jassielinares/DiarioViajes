// Coordenadas de UACM San Lorenzo Tezonco
var uacm = [19.311901359890427, -99.0579322763463];

// Inicializar el mapa
var map = L.map('map').setView(uacm, 17);

// Agregar una capa de teselas al mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Array para almacenar los lugares visitados
var visitedPlaces = [];

// Función para obtener la ubicación actual del usuario mediante el GPS
function getCurrentLocation() {
    // Verificar si el navegador soporta la geolocalización
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                // Obtener y mostrar las coordenadas en un input
                var currentLocationInput = document.getElementById('currentLocation');
                currentLocationInput.value = position.coords.latitude + ',' + position.coords.longitude;
                alert('Ubicación actual obtenida correctamente.');
            },
            function (error) {
                // Manejar errores al obtener la ubicación
                console.error('Error al obtener la ubicación actual:', error.message);
                alert('Error al obtener la ubicación actual: ' + error.message);
            }
        );
    } else {
        // Notificar si la geolocalización no está soportada
        alert('Geolocalización no soportada por el navegador.');
    }
}

// Función para agregar una entrada al diario de viaje
function addEntry() {
    // Obtener elementos del formulario
    var locationInput = document.getElementById('location');
    var experience = document.getElementById('experience').value;
    var fileInput = document.getElementById('fileInput');
    var photoUrlInput = document.getElementById('photoUrl');
    var currentLocationInput = document.getElementById('currentLocation');

    // Obtener las coordenadas según la ubicación proporcionada o la ubicación actual
    var coordinates;
    var locationName;
    if (currentLocationInput.value.trim() !== '') {
        // Si hay coordenadas de ubicación actual
        var currentCoordinates = currentLocationInput.value.trim().split(',');
        coordinates = {
            lat: parseFloat(currentCoordinates[0]),
            lng: parseFloat(currentCoordinates[1])
        };
        locationName = currentLocationInput.value.trim();

        // Continuar con el proceso de agregar entrada
        addEntryAfterCoordinates(coordinates, locationName, experience, fileInput, photoUrlInput);

        // Limpiar campos después de agregar la entrada
        clearFormFields();
    } else {
        // Si no hay coordenadas de ubicación actual, intentar obtenerlas de la ubicación ingresada manualmente
        var location = locationInput.value.trim();
        if (!location) {
            // Notificar si la ubicación ingresada no es válida
            alert('Por favor, ingrese una ubicación válida.');
            return;
        }

        // Utilizar la API de OpenCage Data para obtener las coordenadas de la ubicación ingresada
        var apiKey = 'e90ca70efde3426e8cc351f5683e5a43';
        var requestUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}`;

        // Realizar la solicitud a la API de OpenCage Data
        fetch(requestUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    // Obtener las coordenadas y nombre de la ubicación
                    coordinates = data.results[0].geometry;
                    locationName = location;

                    // Continuar con el proceso de agregar entrada
                    addEntryAfterCoordinates(coordinates, locationName, experience, fileInput, photoUrlInput);

                    // Limpiar campos después de agregar la entrada
                    clearFormFields();
                } else {
                    // Notificar si no se encuentran resultados para la ubicación proporcionada
                    alert('No se encontraron resultados para la ubicación proporcionada.');
                }
            })
            .catch(error => {
                // Manejar errores al obtener las coordenadas
                console.error('Error al obtener coordenadas:', error);
                alert('Hubo un error al obtener las coordenadas. Por favor, intente nuevamente.');
            });
    }
}
// Función para agregar una entrada después de obtener las coordenadas
function addEntryAfterCoordinates(coordinates, locationName, experience, fileInput, photoUrlInput) {
    if (!map) {
        // Notificar si el mapa no está definido
        alert('El mapa no está definido. Verifica la inicialización del mapa.');
        return;
    }

    // Crear un marcador en el mapa con las coordenadas
    var marker = L.marker([coordinates.lat, coordinates.lng]).addTo(map);

    // Obtener la fecha y hora actual
    var currentDate = new Date();
    var formattedDate = currentDate.toLocaleDateString();
    var formattedTime = currentDate.toLocaleTimeString();

    // Crear la cadena de fecha y hora
    var dateTimeString = `${formattedDate} ${formattedTime}`;

    // Crear el contenedor del popup con un scroll
    var popupContainer = document.createElement('div');
    popupContainer.style.maxHeight = '200px';  // Ajusta la altura máxima según tus preferencias
    popupContainer.style.overflowY = 'auto';

    // Crear el contenido del popup con la información de la entrada
    var popupContent = `<strong>Experiencia:</strong> ${experience}<br>`;
    popupContent += `<strong>Ubicación:</strong> ${locationName}<br>`;
    popupContent += `<strong>Coordenadas:</strong> ${coordinates.lat}, ${coordinates.lng}<br>`;
    popupContent += `<strong>Fecha y Hora:</strong> ${dateTimeString}<br>`;

    // Si se seleccionan archivos, mostrar las imágenes y videos en el popup
    if (fileInput.files.length > 0) {
        popupContent += generateMediaContent(fileInput);
    }

    // Si se proporciona una URL de imagen, mostrarla en el popup
    if (photoUrlInput.value.trim() !== '') {
        popupContent += `<img src="${photoUrlInput.value.trim()}" alt="Imagen desde URL" style="max-width: 200px;">`;
    }

    // Agregar el contenido al contenedor del popup
    popupContainer.innerHTML = popupContent;

    // Asociar el contenedor del popup al marcador y mostrarlo
    marker.bindPopup(popupContainer).openPopup();

    // Obtener archivos multimedia seleccionados
    var media = [];
    if (fileInput.files.length > 0) {
        media = generateMediaContent(fileInput).split('</a>');
    }

    // Si se proporciona una URL de imagen, agregarla a los archivos multimedia
    if (photoUrlInput.value.trim() !== '') {
        media.push(`<a href="${photoUrlInput.value.trim()}" target="_blank" rel="noopener">
                        <img src="${photoUrlInput.value.trim()}" alt="Imagen" style="max-width: 100px;">
                    </a>`);
    }

    // Agregar el lugar visitado al array de lugares
    visitedPlaces.push({
        name: locationName,
        coordinates: [coordinates.lat, coordinates.lng],
        dateTime: dateTimeString,
        description: experience,
        media: media  // Agregar la descripción y los archivos multimedia al objeto visitedPlaces
    });

    // Actualizar la lista de lugares en el HTML
    updatePlacesList();

    // Limpiar campos después de agregar la entrada
    clearFormFields();
}


// Obtén el elemento de búsqueda
var searchInput = document.getElementById('searchInput');

// Agrega un event listener al campo de búsqueda para que se actualice en tiempo real
searchInput.addEventListener('input', function () {
    searchPlaces();
});

// Función para buscar lugares
function searchPlaces() {
    // Obtén el valor de búsqueda del input
    var searchValue = searchInput.value.toLowerCase();

    if (searchValue.trim() === '') {
        // Si el campo de búsqueda está vacío, muestra la lista completa de lugares
        updatePlacesList();
    } else {
        // Filtra los lugares que coincidan con el valor de búsqueda
        var filteredPlaces = visitedPlaces.filter(function (place) {
            return place.name.toLowerCase().includes(searchValue);
        });

        // Actualiza la lista de lugares con los resultados de la búsqueda
        updatePlacesList(filteredPlaces);
    }
}

// Función para actualizar la lista de lugares en el HTML
function updatePlacesList(places = visitedPlaces) {
    var placesList = document.getElementById('places');
    placesList.innerHTML = '';

    // Itera sobre los lugares visitados (o los lugares filtrados) y crea elementos de lista en el HTML
    places.forEach(place => {
        var listItem = document.createElement('li');
        
        // Crear el contenido del elemento de lista con la descripción, imágenes o videos
        var listContent = `<strong>VISITASTE: ${place.name}</strong><br>`;
        listContent += `<span>FECHA Y HORA: ${place.dateTime}</span><br>`;
        listContent += `<span>DESCRIPCION DEL VIAJE:${place.description}</span><br>`;

        // Si hay archivos multimedia, mostrarlos en la lista
        if (place.media.length > 0) {
            listContent += generateMediaContentForList(place.media);
        }

        listItem.innerHTML = listContent;

        // Agregar un event listener para animar el zoom del mapa al hacer clic en un lugar
        listItem.addEventListener('click', function () {
            map.flyTo(place.coordinates, 13, {
                animate: true,
                duration: 2 // Duración de la animación en segundos
            });
        });

        // Agregar el elemento de lista al HTML
        placesList.appendChild(listItem);
    });
}



// Función para generar contenido de medios (imágenes y videos) para la lista de lugares
function generateMediaContentForList(media) {
    var mediaContent = '<div class="media-container">';

    media.forEach((mediaItem, index) => {
        // Cerrar la fila anterior y abrir una nueva cada 5 elementos
        if (index > 0 && index % 5 === 0) {
            mediaContent += '</div><div class="media-container">';
        }

        // Agregar la imagen o video a la lista
        mediaContent += `<div class="media-item">${mediaItem}</div>`;
    });

    mediaContent += '</div>';
    return mediaContent;
}




// Agregar un event listener para el cambio en el input de archivo
var fileInput = document.getElementById('fileInput');
var customFileUpload = document.querySelector('.custom-file-upload');

fileInput.addEventListener('change', function () {
    // Agregar la clase 'active' al botón de carga de archivos cuando se selecciona un archivo
    customFileUpload.classList.add('active');
});

// Coordenadas del centro del mapa del mundo
var worldCenter = [0, 0];

// Función para mostrar el mapa completo con animación de alejamiento
function showFullMap() {
    if (map) {
        // Animar alejamiento
        map.flyTo(worldCenter, 1, {
            animate: true,
            duration: 2 // Ajusta la duración de la animación según tus preferencias
        });
    }
}

// Función para limpiar los campos del formulario
function clearFormFields() {
    var entradaUbicacion = document.getElementById('location');
    var experienciaEntrada = document.getElementById('experience');
    var entradaArchivo = document.getElementById('fileInput');
    var entradaUrlFoto = document.getElementById('photoUrl');
    var entradaUbicacionActual = document.getElementById('currentLocation');

    // Limpiar los valores de los campos
    entradaUbicacion.value = '';
    experienciaEntrada.value = '';
    entradaArchivo.value = '';
    entradaUrlFoto.value = '';
    entradaUbicacionActual.value = '';
}

// Event listener para cambios en el campo de ubicación manual
var locationInput = document.getElementById('location');
locationInput.addEventListener('input', function () {
    // Obtener el valor actual del campo de ubicación manual
    var inputLocation = locationInput.value.trim();

    // Verificar si el valor no está vacío
    if (inputLocation !== '') {
        // Utilizar la API de OpenCage Data para obtener sugerencias de lugares
        var apiKey = 'e90ca70efde3426e8cc351f5683e5a43';
        var requestUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(inputLocation)}&key=${apiKey}`;

        // Realizar la solicitud a la API de OpenCage Data
        axios.get(requestUrl)
            .then(response => {
                if (response.data.results && response.data.results.length > 0) {
                    // Obtener las sugerencias de lugares
                    var suggestions = response.data.results.map(result => result.formatted);

                    // Mostrar las sugerencias en algún lugar de tu interfaz (por ejemplo, en un div)
                    showLocationSuggestions(suggestions);
                } else {
                    // Limpiar las sugerencias si no hay resultados
                    clearLocationSuggestions();
                }
            })
            .catch(error => {
                // Manejar errores
                console.error('Error al obtener sugerencias de ubicación:', error);
                clearLocationSuggestions();
            });
    } else {
        // Limpiar las sugerencias si el campo está vacío
        clearLocationSuggestions();
    }
});

// Función para mostrar sugerencias de ubicación
function showLocationSuggestions(suggestions) {
    // Obtener el contenedor de sugerencias
    var suggestionsContainer = document.getElementById('locationSuggestions');

    // Limpiar el contenido actual del contenedor
    suggestionsContainer.innerHTML = '';

    // Crear elementos de lista para cada sugerencia
    suggestions.forEach(suggestion => {
        var listItem = document.createElement('li');
        listItem.textContent = suggestion;

        // Agregar un event listener para llenar el campo de ubicación al hacer clic en una sugerencia
        listItem.addEventListener('click', function () {
            locationInput.value = suggestion;
            clearLocationSuggestions();
        });

        // Agregar el elemento de lista al contenedor
        suggestionsContainer.appendChild(listItem);
    });

    // Mostrar el contenedor de sugerencias
    suggestionsContainer.style.display = 'block';
}

// Función para limpiar las sugerencias de ubicación
function clearLocationSuggestions() {
    // Ocultar el contenedor de sugerencias
    var suggestionsContainer = document.getElementById('locationSuggestions');
    suggestionsContainer.style.display = 'none';
}


// Función para generar contenido de medios (imágenes y videos) para el popup
function generateMediaContent(fileInput) {
    var mediaContent = '';

    for (var i = 0; i < fileInput.files.length; i++) {
        var mediaFile = fileInput.files[i];
        var mediaType = mediaFile.type.split('/')[0]; // 'image' o 'video'

        // Mostrar miniatura de la imagen o icono de video
        if (mediaType === 'image') {
            mediaContent += `<img src="${URL.createObjectURL(mediaFile)}" alt="Imagen" style="max-width: 300px;">`;
        } else if (mediaType === 'video') {
            mediaContent += `<video width="100%" height="auto" controls autoplay>
                                <source src="${URL.createObjectURL(mediaFile)}" type="${mediaFile.type}">
                             </video>`;
        }

        mediaContent += `</a>`;
    }

    return mediaContent;
}
