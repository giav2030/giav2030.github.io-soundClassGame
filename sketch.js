// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Implements Craig Reynold's autonomous steering behaviors
// One vehicle "arrive"
// See: http://www.red3d.com/cwr/

//sound classifier variables
let soundClassifier;
let soundModel = '...';
let words = [
  // "zero",
  // "one",
  // "two",
  // "three",
  // "four",
  // "five",
  // "six",
  // "seven",
  // "eight",
  // "nine",
  "up",
  "down",
  "left",
  "right"
  // "go",
  // "stop",
  // "yes",
  // "no",
];
let x, y;
let predictedWord = "";
let lastWord = ""; // track last word to avoid repeats
let isSpeaking = false; // prevent overlapping TTS requests
let lastTTSTime = 0; // cooldown timer to prevent spamming

//vehicle variable
let vehicles = [];

// Voice-controlled attractor
let attractor;

// Overlap timer
let overlapStartTime = 0;
let overlapDuration = 0;
let isOverlapping = false;
let caught = false; // true when overlap >= 3 seconds

//load sound model
function preload(){
  let options = {probabilityThreshold: 0.9};
soundClassifier = ml5.soundClassifier("SpeechCommands18w", options);
}



function setup() {
  createCanvas(windowWidth, windowHeight);
  //get results sound model
  soundClassifier.classifyStart(gotResults); 

  //create new vehicle
  for(let i = 0; i < 20; i++){
     vehicles.push (new Vehicle(random(width), random(height)));
  }
  

  // Create attractor at center
  attractor = new Attractor(width / 2, height / 2);
}

function draw() {
  background(caught ? color(200, 50, 50) : 255);
  //call function
  displayWords();

  if (predictedWord !== ""){
    fill(211, 107, 255);
    textAlign(CENTER, CENTER);
    textSize(64);
    text(predictedWord, width/2, 120);
  }

  // Update and draw the voice-controlled attractor
  attractor.update();
  attractor.show();

  // Vehicle follows the attractor
  // Check if any vehicle is inside the attractor circle
  let anyInside = false;
  for(let v of vehicles){
    v.arrive(attractor.position);
    v.update();
    v.show();

    let d = p5.Vector.dist(v.position, attractor.position);
    if (d < attractor.radius) {
      anyInside = true;
    }
  }

  // Track how long at least one vehicle has been inside
  if (anyInside) {
    if (!isOverlapping) {
      overlapStartTime = millis();
      isOverlapping = true;
    }
    overlapDuration = (millis() - overlapStartTime) / 1000;
    if (overlapDuration >= 1.5) {
      caught = true;
    }
  } else {
    isOverlapping = false;
    overlapDuration = 0;
  }

  // Display the overlap timer
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(24);
  text("Overlap: " + nf(overlapDuration, 1, 1) + "s", 10, 10);
  if (caught) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("CAUGHT!", width / 2, height / 2);
  }
}

function gotResults(results){
   let label = results[0].label;                                                                                                       
      
       // Only accept words in the array, ignore everything else                                                                           
     if (!words.includes(label)) return;                                                                                                 
                                                                                                                                         
       predictedWord = label;                                                                                                              
                               

  // Steer attractor based on detected word
  attractor.setDirection(predictedWord);

  // Only generate TTS if it's a new word and enough time has passed (5s cooldown)
  if (predictedWord !== lastWord && millis() - lastTTSTime > 5000) {
    lastWord = predictedWord;
    lastTTSTime = millis();
    // generateSpeech("You said " + predictedWord); // DISABLED: re-enable when daily limit resets
  }
}

// Call the Node.js server to generate speech via Runway API
async function generateSpeech(text) {
  if (isSpeaking) return; // skip if already generating
  isSpeaking = true;

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, voicePreset: 'Maya' })
    });
    const data = await response.json();

    if (data.audioUrl) {
      let audio = new Audio(data.audioUrl);
      audio.onended = () => { isSpeaking = false; };
      audio.play();
    } else {
      console.error('TTS error:', data.error);
      isSpeaking = false;
    }
  } catch (err) {
    console.error('Failed to generate speech:', err);
    isSpeaking = false;
  }
}

function displayWords(){
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(96);
  text("say one of these words to guide the ball!", width/2, 40);
  text("escape from the bad arrows", width/2, 80);
  
  x = width/2;
  y = 0;
  // Words appear in 3 columns of 6 rows
  for (let i = 0; i < words.length; i++) {
    fill(158);
    if(i < 1){
      fill(255,0,0);
      text(words[i], x, y + 10);  
    } 
    else if(i < 2){
      fill(0,255,0);
      text(words[i], x, y + height - 50);
    }
    else if(i < 3){
      fill(0,0,255);
      text(words[i], 50, y + height / 2);
    }
    else {
      fill(255,255,0);
      text(words[i], x*2 -50, y + height / 2);
    }
  }
}