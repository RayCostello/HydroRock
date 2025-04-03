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

// Load plant images
const plantImages = [
    "seedling.png",   // 0% growth
    "smallPlant.png", // 25% growth
    "mediumPlant.png", // 50% growth
    "largePlant.png", // 75% growth
    "fullyGrown.png"  // 100% growth
];
let plantImage = new Image();
plantImage.src = plantImages[2]; // Start at medium plant

// Game loop
function updateGame() {
    let water = parseInt(waterSlider.value);
    let nutrients = parseInt(nutrientSlider.value);
    let light = parseInt(lightSlider.value);

    if (water > 30 && nutrients > 30 && light > 30) {
        growthProgress += growthRate;
        if (growthProgress > maxGrowth) growthProgress = maxGrowth;
    } else {
        growthProgress -= growthRate;
        if (growthProgress < 0) growthProgress = 0;
    }

    updatePlantAppearance();
    updateStatus();

    drawGame();
    requestAnimationFrame(updateGame);
}

// Update plant appearance based on growth
function updatePlantAppearance() {
    let stage = Math.floor((growthProgress / maxGrowth) * (plantImages.length - 1));
    plantImage.src = plantImages[stage];
}

// Update status text
function updateStatus() {
    if (growthProgress === maxGrowth) {
        statusText.innerText = "The plant is fully grown!";
    } else if (growthProgress === 0) {
        statusText.innerText = "The plant is dying! Adjust resources!";
    } else {
        statusText.innerText = "The plant is growing...";
    }
}

// Draw the game
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(plantImage, 100, 100, 200, 300);
}

// Start the game loop
updateGame();
