
let angle = 0;

//let fondoHue = 0; // Empezamos en rojo (0)
let figuraOpacidad = 0.4;
let img; // Variable para la imagen

let fondoHues = [0, 320, 280, 300, 340]; // Solo tonos rojo, rosado, violeta, fucsia
let fondoHueIndex = 0;
let fondoHue = fondoHues[0]; // Inicializa el fondo

// variables de CONFIGURACION
let mic; // NUEVO: variable para el micrófono
let fft; // NUEVO: variable para el FFT (Fast Fourier Transform)
let micLevel = 0; // NUEVO: nivel de volumen

let AMP_MIN = 0.01;
let AMP_MAX = 0.4; // Ajusta el rango de amplitud


// NUEVO: variables para el cambio brusco de frecuencia
let prevFreq = 0; // Para guardar la frecuencia anterior
let freqChangeThreshold = 1000; // Umbral de cambio brusco en Hz

let sonidoFrames = 0; // Cuenta los frames con sonido
let rotSpeed = 0;     // Velocidad de rotación


function preload() {
  img = loadImage('poligono1.png'); // Cambia por el nombre de tu archivo
}

function setup() {
  createCanvas(800, 800);
  rectMode(CENTER);
  angleMode(DEGREES);
  colorMode(HSL, 360, 100, 100, 1); 

  // NUEVO: inicializar micrófono
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
}

function draw() {

 // NUEVO: obtener nivel de volumen del micrófono
  micLevel = mic.getLevel();

  // Ajusta el rango si es necesario
  let simulatedVolume = constrain(map(micLevel, 0, AMP_MIN, 0, AMP_MAX), 0, 1);
  let lineHeight = map(simulatedVolume, 0, 1, 50, 300);


    // Frecuencia
  let spectrum = fft.analyze();
  let peakIndex = spectrum.indexOf(max(spectrum));
  let nyquist = sampleRate() / 2;
  let freq = map(peakIndex, 0, spectrum.length, 0, nyquist);




  // --- CAMBIO DE FONDO POR CAMBIO BRUSCO DE FRECUENCIA ---
  if (abs(freq - prevFreq) > freqChangeThreshold) {
    fondoHueIndex = (fondoHueIndex + 1) % fondoHues.length;
    fondoHue = fondoHues[fondoHueIndex];
  }
  prevFreq = freq;

  // Fondo: transición SOLO entre rojo, rosado y violeta
  let fondoColor = color(fondoHue, 70, 40);
  background(fondoColor);

  let umbralSonido = 0.002;
  if (micLevel > umbralSonido) {
    sonidoFrames++;
    // La velocidad de rotación depende de los frames con sonido
    rotSpeed = map(sonidoFrames, 0, 60, 0.1, 2, true); // 0.1 a 2 grados/frame    // Aplica la rotación
    angle += rotSpeed;
  } else {
    sonidoFrames = 0; // Reinicia si no hay sonido
  }


  push();
   translate(width / 2, height / 2);
   rotate(angle);
   tint(255, figuraOpacidad * 255);
   imageMode(CENTER);
   image(img, 0, 0, 700, 660);
  pop();

  // Capa 3: líneas verticales negras
  stroke(0);                // Define el color de las líneas como negro
  strokeWeight(3);          // Define el grosor de las líneas

  let durationFactor = 25;  // Cantidad de líneas verticales a dibujar
  let spacing = width / durationFactor; // Espacio horizontal entre cada línea

 for (let i = 0; i < durationFactor; i++) {
   let x = i * spacing;    // Calcula la posición x de cada línea
   line( x,  height / 2 - lineHeight / 2, // Punto inicial en y (centrado verticalmente)
     x,  height / 2 + lineHeight / 2  // Punto final en y (centrado verticalmente)
   );
 }


    // Visualización simple
  textSize(26);
  text('Frecuencia dominante: ' + nf(freq, 0, 2) + ' Hz', 10, 20);
  text('Volumen: ' + nf(micLevel, 0, 3), 10, 40);

}



