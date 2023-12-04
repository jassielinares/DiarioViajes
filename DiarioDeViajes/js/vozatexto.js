// Obtener referencia al botón de inicio de grabación y al área de texto de la experiencia
const startRecordingButton = document.getElementById('startRecording');
const experienceTextarea = document.getElementById('experience');

// Variable para rastrear si la grabación está en curso o no
let isRecording = false;

// Crear un objeto de reconocimiento de voz usando la API webkitSpeechRecognition (o SpeechRecognition si webkitSpeechRecognition no está disponible)
const recognition = new webkitSpeechRecognition() || new SpeechRecognition();

// Establecer el idioma de reconocimiento como español
recognition.lang = 'es-ES';

// Manejar el evento cuando se inicia la grabación
recognition.onstart = () => {
    isRecording = true;
    startRecordingButton.textContent = 'Detener grabación';
    startRecordingButton.classList.add('recording'); // Añadir la clase de grabación
};

// Manejar el evento cuando se obtiene un resultado de la grabación
recognition.onresult = (event) => {
    // Obtener el texto transcribido del primer resultado y agregarlo al área de texto de la experiencia
    const transcript = event.results[0][0].transcript;
    experienceTextarea.value += transcript + ' ';
};

// Manejar el evento cuando se detiene la grabación
recognition.onend = () => {
    isRecording = false;
    startRecordingButton.textContent = 'Iniciar grabación';
    startRecordingButton.classList.remove('recording'); // Quitar la clase de grabación
};

// Agregar un evento de clic al botón de inicio de grabación para alternar entre iniciar y detener la grabación
startRecordingButton.addEventListener('click', () => {
    if (isRecording) {
        recognition.stop(); // Detener la grabación si ya está en curso
    } else {
        recognition.start(); // Iniciar la grabación si no está en curso
    }
});
