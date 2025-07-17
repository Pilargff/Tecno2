let mascara1, mascara2, mascara3;
let capaLineas1, capaLineas2, capaLineas3;
let mascara2FlipH = false;
let mascara2FlipV = false; // para flip horizontal y vertical de la máscara 2

let opacidad3 = 255;

let tonosFondo = [342, 330, 336, 331, 340];
let indiceTonoFondo;
let tonoFondo;

let gestorAudio;
let AMP_MIN = 0.03;
let umbralCambioFrecuencia = 110; //si el color cambia demasiado rapido aumentar este parametro
let frecuenciaBase = 350;


let ultimaFrecuenciaActivada = 0;
let formaCapa1;

// Gestor de Sonido
class GestorAudio {
  constructor() {
    this.mic = new p5.AudioIn();
    this.mic.start();
    this.fft = new p5.FFT();
    this.fft.setInput(this.mic);

    this.volumen = 0;
    this.volumenSuavizado = 0;
    this.frecuencia = 0;
    this.frecuenciaSuavizada = 0;
    this.timbre = "grave";
  }

  actualizar() {
    this.volumen = this.mic.getLevel();
    this.volumenSuavizado = lerp(this.volumenSuavizado, this.volumen, 0.1);

    let espectro = this.fft.analyze();
    let indicePico = espectro.indexOf(max(espectro));
    let nyquist = sampleRate() / 2;
    this.frecuencia = map(indicePico, 0, espectro.length, 0, nyquist);
    this.frecuenciaSuavizada = lerp(this.frecuenciaSuavizada, this.frecuencia, 0.1);

    // Timbre
    let energiaBaja = this.fft.getEnergy("bass");
    let energiaMedia = this.fft.getEnergy("mid");
    let energiaAlta = this.fft.getEnergy("treble");

    if (energiaAlta > energiaMedia && energiaAlta > energiaBaja) {
      this.timbre = "agudo";
    } else if (energiaMedia > energiaBaja) {
      this.timbre = "medio";
    } else {
      this.timbre = "grave";
    }
  }

  getVolumen() {
    return this.volumenSuavizado;
  }

  getFrecuencia() {
    return this.frecuenciaSuavizada;
  }

  getTimbre() {
    return this.timbre;
  }
}

function preload() {
  mascara1 = loadImage('mask1.png');
  mascara2 = loadImage('mask2.png');
  mascara3 = loadImage('mask3.png');
  mascara2FlipH = random([true, false]);
mascara2FlipV = random([true, false]);

}

function setup() {
  createCanvas(900, 900);
  imageMode(CORNER);
  colorMode(HSB, 360, 100, 100);

  capaLineas1 = createGraphics(mascara1.width, mascara1.height);
  capaLineas3 = createGraphics(mascara3.width, mascara3.height);

  gestorAudio = new GestorAudio();

  indiceTonoFondo = floor(random(tonosFondo.length));
  tonoFondo = tonosFondo[indiceTonoFondo];

  formaCapa1 = 0; // vertical por defecto
}

function draw() {
  gestorAudio.actualizar();

  let volumen = gestorAudio.getVolumen();
  let frecuencia = gestorAudio.getFrecuencia();
  let timbreDominante = gestorAudio.getTimbre();

  let volumenNormalizado = constrain(map(volumen, 0, AMP_MIN, 0, 1), 0, 1);

  // Condición: solo reacciona si supera frecuencia base
  if (volumen > AMP_MIN && frecuencia > frecuenciaBase) {
    if (abs(frecuencia - ultimaFrecuenciaActivada) > umbralCambioFrecuencia) {
      indiceTonoFondo = (indiceTonoFondo + 1) % tonosFondo.length;
      tonoFondo = tonosFondo[indiceTonoFondo];
      ultimaFrecuenciaActivada = frecuencia;
    }
  }

  let escalaGlobal = 3;
  push();
  translate(width / 2, height / 2);
  scale(escalaGlobal);
  translate(-width / 2, -height / 2);

  background(color(tonoFondo, 80, 70));


  // --- Máscara 1
  let x1 = (width - mascara1.width) / 2;
  let y1 = (height - mascara1.height) / 2;

  capaLineas1.clear();
  capaLineas1.stroke(0);
  capaLineas1.strokeWeight(3);
  let espaciado1 = map(volumenNormalizado, 0, 1, 10, 2);
espaciado1 = max(espaciado1, 5);

  capaLineas1.push();
  capaLineas1.translate(mascara1.width / 2, mascara1.height / 2);
  if (frecuencia > frecuenciaBase) {
  let angulo = frameCount * 0.01;
  capaLineas1.rotate(angulo);
}

  capaLineas1.translate(-mascara1.width / 2, -mascara1.height / 2);

  for (let i = 0; i <= mascara1.width; i += espaciado1) {
    capaLineas1.line(i, 0, i, mascara1.height); // vertical por defecto
  }

  capaLineas1.pop();
  let lineasMascara1 = capaLineas1.get();
  lineasMascara1.mask(mascara1);
  image(lineasMascara1, x1, y1);

  // --- Máscara 2
  let ancho2 = mascara2.width;
  let alto2 = mascara2.height;

  let mascara2Redimensionada = createImage(ancho2, alto2);
mascara2Redimensionada.copy(mascara2, 0, 0, ancho2, alto2, 0, 0, ancho2, alto2);

if (mascara2FlipH || mascara2FlipV) {
  mascara2.loadPixels();
  mascara2Redimensionada.loadPixels();
  for (let y = 0; y < alto2; y++) {
    for (let x = 0; x < ancho2; x++) {
      let sx = mascara2FlipH ? ancho2 - 1 - x : x;
      let sy = mascara2FlipV ? alto2 - 1 - y : y;
      let srcIdx = 4 * (sx + sy * ancho2);
      let dstIdx = 4 * (x + y * ancho2);
      for (let c = 0; c < 4; c++) {
        mascara2Redimensionada.pixels[dstIdx + c] = mascara2.pixels[srcIdx + c];
      }
    }
  }
  mascara2Redimensionada.updatePixels();
}


  if (!capaLineas2 || capaLineas2.width !== ancho2 || capaLineas2.height !== alto2) {
    capaLineas2 = createGraphics(ancho2, alto2);
  }

  capaLineas2.clear();
  capaLineas2.stroke(0);
  capaLineas2.strokeWeight(2);
  let espaciado2 = 5;

  if (timbreDominante === "grave") {
    for (let x = 0; x <= ancho2; x += espaciado2) {
      capaLineas2.line(x, 0, x, alto2);
    }
  } else if (timbreDominante === "medio") {
    for (let y = 0; y <= alto2; y += espaciado2) {
      capaLineas2.line(0, y, ancho2, y);
    }
  } else {
    for (let i = -alto2; i <= ancho2; i += espaciado2) {
      capaLineas2.line(i, 0, i + alto2, alto2);
    }
  }

  let lineasMascara2 = capaLineas2.get();
  lineasMascara2.mask(mascara2Redimensionada);
  let x2 = (width - ancho2) / 2;
  let y2 = (height - alto2) / 2;
  image(lineasMascara2, x2, y2);

  // --- Máscara 3
  let frecuenciaNormalizada = constrain(map(frecuencia, 100, 4000, 0, 1), 0, 1);
let ancho3 = map(frecuenciaNormalizada, 0, 1, mascara3.width * 0.7, mascara3.width * 1.2);
let alto3 = map(frecuenciaNormalizada, 0, 1, mascara3.height * 0.7, mascara3.height * 1.2);





  opacidad3 = map(frecuenciaNormalizada, 0, 1, 190, 255);

  let mascara3Redimensionada = mascara3.get();
  mascara3Redimensionada.resize(ancho3, alto3);

  if (!capaLineas3 || capaLineas3.width !== ancho3 || capaLineas3.height !== alto3) {
    capaLineas3 = createGraphics(ancho3, alto3);
  }

  capaLineas3.clear();
  capaLineas3.stroke(0, opacidad3);
  capaLineas3.strokeWeight(1);
  let espaciado3 = 3;

  for (let x = 0; x <= ancho3; x += espaciado3) {
    capaLineas3.line(x, 0, x, alto3);
  }

  let lineasMascara3 = capaLineas3.get();
  lineasMascara3.mask(mascara3Redimensionada);
  let x3 = (width - ancho3) / 2;
  let y3 = (height - alto3) / 2;
  image(lineasMascara3, x3, y3);

  pop();

  // UI
  // fill(255);
  //textSize(16);
  //text('Frecuencia dominante: ' + nf(frecuencia, 0, 2) + ' Hz', 10, 20);
  //text('Volumen: ' + nf(volumen, 0, 3), 10, 40);
  //text('Timbre: ' + timbreDominante, 10, 60); 
}
