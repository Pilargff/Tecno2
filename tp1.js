let prevMouseX = 0;
let prevMouseY = 0;
let mouseSpeed = 0;
let angle = 0;
let fondoHue = 0; // Empezamos en rojo (0)
let figuraOpacidad = 0.4;
let modoInverso = false;

function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  angleMode(DEGREES);
  colorMode(HSL, 360, 100, 100, 1); // <- Esta línea arregla el problema
}

function draw() {
  // Calcular velocidad del mouse
  let dx = mouseX - prevMouseX;
  let dy = mouseY - prevMouseY;
  mouseSpeed = sqrt(dx * dx + dy * dy);

  // Simulamos volumen con velocidad del mouse
  let simulatedVolume = constrain(map(mouseSpeed, 0, 50, 0, 1), 0, 1);
  let lineHeight = map(simulatedVolume, 0, 1, 50, 300);

  // Simular dirección con movimiento hacia la derecha
  if (mouseX > prevMouseX) {
    angle += 0.5;
  } else if (mouseX < prevMouseX) {
    angle -= 0.5;
  }

  // Simular timbre o frecuencia con movimiento vertical: cambia opacidad
  let verticalSpeed = abs(mouseY - prevMouseY);
  figuraOpacidad = map(verticalSpeed, 0, 30, 0.2, 0.7, true);

  // Fondo: transición SOLO entre rojo, rosado y violeta (hue 0 a 300)
  let fondoColor = color(fondoHue, 80, 55); // Saturado y luminoso dentro de la gama definida
  background(fondoColor);

  // Capa 2: forma central giratoria con opacidad
  push();
  translate(width / 2, height / 2);
  rotate(angle);
  fill(0, 0, 10, figuraOpacidad);
  noStroke();
  quad(-100, -80, 100, -80, 80, 80, -80, 80);
  pop();

  // Capa 3: líneas verticales negras
  stroke(0);
  strokeWeight(2);
  let durationFactor = 25;
  let spacing = width / durationFactor;

  for (let i = 0; i < durationFactor; i++) {
    let x = i * spacing;
    line(x, height / 2 - lineHeight / 2, x, height / 2 + lineHeight / 2);
  }

  // Guardar posición del mouse para el siguiente frame
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function mousePressed() {
  // Cambiar color de fondo en pasos de rojo a violeta pasando solo por rosado
  fondoHue += 40;
  if (fondoHue > 300) fondoHue = 0; // Limitar a gama 0-300 (rojo a violeta)
}

function doubleClicked() {
  // Alternar modo inverso con doble clic
  modoInverso = !modoInverso;
}