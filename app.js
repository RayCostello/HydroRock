const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Sliders
const waterSlider = document.getElementById("waterSlider");
const nutrientSlider = document.getElementById("nutrientSlider");
const lightSlider = document.getElementById("lightSlider");

// Status text
const statusText = document.getElementById("statusText");

// Plant growth variables
let growthProgress = 50; 
let maxGrowth = 100;
let growthRate = 0.5;
let diseaseChance = 0.01; // 1% chance per frame
let isDiseased = false;

// Timer for plant growth (simulated days)
let days = 0;
setInterval(() => { days++; }, 5000); // Increment every 5 seconds

// Load plant images
const plantImages = [
    "seedling.png",   // 0% growth
    "smallPlant.png", // 25% growth
    "mediumPlant.png", // 50% growth
    "largePlant.png", // 75% growth
    "fullyGrown.png",  // 100% growth
    "diseasedPlant.png" // Diseased plant
];
let plantImage = new Image();
plantImage.src = plantImages[2]; // Start at medium plant

// Load sounds
const waterSound = new Audio("water.mp3");
const growthSound = new Audio("growth.mp3");
const diseaseSound = new Audio("disease.mp3");

// Game loop
function updateGame() {
    let water = parseInt(waterSlider.value);
    let nutrients = parseInt(nutrientSlider.value);
    let light = parseInt(lightSlider.value);

    if (water > 30 && nutrients > 30 && light > 30) {
        growthProgress += growthRate;
        if (growthProgress > maxGrowth) growthProgress = maxGrowth;
        growthSound.play();
    } else {
        growthProgress -= growthRate;
        if (growthProgress < 0) growthProgress = 0;
    }

    // Disease chance
    if (Math.random() < diseaseChance) {
        isDiseased = true;
        diseaseSound.play();
    }

    updatePlantAppearance();
    updateStatus();

    drawGame();
    requestAnimationFrame(updateGame);
}

// Update plant appearance based on growth and disease
function updatePlantAppearance() {
    if (isDiseased) {
        plantImage.src = plantImages[5]; // Diseased plant
    } else {
        let stage = Math.floor((growthProgress / maxGrowth) * (plantImages.length - 2));
        plantImage.src = plantImages[stage];
    }
}

// Update status text
function updateStatus() {
    if (isDiseased) {
        statusText.innerText = "The plant is diseased! Reduce water and add nutrients.";
    } else if (growthProgress === maxGrowth) {
        statusText.innerText = "The plant is fully grown!";
    } else if (growthProgress === 0) {
        statusText.innerText = "The plant is dying! Adjust resources!";
    } else {
        statusText.innerText = `Day ${days}: The plant is growing...`;
    }
}

// Draw the game
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(plantImage, 100, 100, 200, 300);
}

// Event listeners for sliders
waterSlider.addEventListener("input", () => waterSound.play());
nutrientSlider.addEventListener("input", () => waterSound.play());
lightSlider.addEventListener("input", () => waterSound.play());

// Start the game loop
updateGame();
