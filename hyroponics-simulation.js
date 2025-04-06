// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get UI elements
const waterSlider = document.getElementById('waterSlider');
const nutrientSlider = document.getElementById('nutrientSlider');
const lightSlider = document.getElementById('lightSlider');
const waterValue = document.getElementById('waterValue');
const nutrientValue = document.getElementById('nutrientValue');
const lightValue = document.getElementById('lightValue');
const daysInput = document.getElementById('daysInput');
const simulateBtn = document.getElementById('simulateBtn');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('statusText');

// Stats elements
const currentDayElement = document.getElementById('currentDay');
const plantHeightElement = document.getElementById('plantHeight');
const plantHealthElement = document.getElementById('plantHealth');
const waterLevelElement = document.getElementById('waterLevel');
const nutrientLevelElement = document.getElementById('nutrientLevel');
const plantStatusElement = document.getElementById('plantStatus');

// Plant simulation parameters
let simulation = {
    currentDay: 0,
    plantHeight: 0,
    plantHealth: 100,
    waterLevel: 50,
    nutrientLevel: 50,
    lightLevel: 50,
    status: 'Seedling', // Seedling, Growing, Mature, Dying, Dead
    isAlive: true,
    growthRate: 0,
    drainRate: 0.5, // Water drains by this percentage each day
    nutrientUseRate: 0.3, // Nutrients used by this percentage each day
    optimalRanges: {
        water: { min: 40, max: 70 },
        nutrients: { min: 40, max: 70 },
        light: { min: 40, max: 70 }
    }
};

// Water animation parameters
let waterDrops = [];
let nutrientParticles = [];
let lightBeams = [];

// Initialize the simulation
function init() {
    // Set slider values
    waterSlider.value = 50;
    nutrientSlider.value = 50;
    lightSlider.value = 50;
    waterValue.textContent = 50;
    nutrientValue.textContent = 50;
    lightValue.textContent = 50;
    
    updateSimulationStats();
    draw();
}

// Reset the simulation
function resetSimulation() {
    simulation = {
        currentDay: 0,
        plantHeight: 0,
        plantHealth: 100,
        waterLevel: parseInt(waterSlider.value),
        nutrientLevel: parseInt(nutrientSlider.value),
        lightLevel: parseInt(lightSlider.value),
        status: 'Seedling',
        isAlive: true,
        growthRate: 0,
        drainRate: 0.5,
        nutrientUseRate: 0.3,
        optimalRanges: {
            water: { min: 40, max: 70 },
            nutrients: { min: 40, max: 70 },
            light: { min: 40, max: 70 }
        }
    };
    
    updateSimulationStats();
    draw();
    statusText.textContent = "Simulation reset! Adjust the sliders and simulate days to grow your plant.";
}

// Event listeners for sliders
waterSlider.addEventListener('input', function() {
    const value = parseInt(this.value);
    waterValue.textContent = value;
    
    // Create water drop animation
    createWaterAnimation(value);
    
    simulation.waterLevel = value;
    updateSimulationStats();
});

nutrientSlider.addEventListener('input', function() {
    const value = parseInt(this.value);
    nutrientValue.textContent = value;
    
    // Create nutrient particle animation
    createNutrientAnimation(value);
    
    simulation.nutrientLevel = value;
    updateSimulationStats();
});

lightSlider.addEventListener('input', function() {
    const value = parseInt(this.value);
    lightValue.textContent = value;
    
    // Create light beam animation
    createLightAnimation(value);
    
    simulation.lightLevel = value;
    updateSimulationStats();
});

// Simulate growth button
simulateBtn.addEventListener('click', function() {
    const days = parseInt(daysInput.value);
    
    if (days < 1 || days > 30) {
        statusText.textContent = "Please enter a valid number of days (1-30).";
        return;
    }
    
    simulateGrowth(days);
});

// Reset button
resetBtn.addEventListener('click', resetSimulation);

// Simulate plant growth for a number of days
function simulateGrowth(days) {
    if (!simulation.isAlive) {
        statusText.textContent = "Your plant is dead. Please reset the simulation to start over.";
        return;
    }
    
    let message = "";
    
    for (let i = 0; i < days; i++) {
        simulation.currentDay++;
        
        // Calculate health impact based on conditions
        let healthImpact = 0;
        
        // Check water conditions
        if (simulation.waterLevel < simulation.optimalRanges.water.min) {
            healthImpact -= (simulation.optimalRanges.water.min - simulation.waterLevel) / 10;
            message = "Your plant needs more water!";
        } else if (simulation.waterLevel > simulation.optimalRanges.water.max) {
            healthImpact -= (simulation.waterLevel - simulation.optimalRanges.water.max) / 10;
            message = "Your plant has too much water!";
        }
        
        // Check nutrient conditions
        if (simulation.nutrientLevel < simulation.optimalRanges.nutrients.min) {
            healthImpact -= (simulation.optimalRanges.nutrients.min - simulation.nutrientLevel) / 15;
            if (!message) message = "Your plant needs more nutrients!";
        } else if (simulation.nutrientLevel > simulation.optimalRanges.nutrients.max) {
            healthImpact -= (simulation.nutrientLevel - simulation.optimalRanges.nutrients.max) / 15;
            if (!message) message = "Your plant has too many nutrients!";
        }
        
        // Check light conditions
        if (simulation.lightLevel < simulation.optimalRanges.light.min) {
            healthImpact -= (simulation.optimalRanges.light.min - simulation.lightLevel) / 20;
            if (!message) message = "Your plant needs more light!";
        } else if (simulation.lightLevel > simulation.optimalRanges.light.max) {
            healthImpact -= (simulation.lightLevel - simulation.optimalRanges.light.max) / 20;
            if (!message) message = "Your plant has too much light!";
        }
        
        // Update plant health
        simulation.plantHealth = Math.max(0, Math.min(100, simulation.plantHealth + healthImpact));
        
        // Calculate growth rate based on conditions and health
        if (simulation.plantHealth > 70) {
            simulation.growthRate = 2 + (simulation.plantHealth - 70) / 10;
        } else if (simulation.plantHealth > 40) {
            simulation.growthRate = 1 + (simulation.plantHealth - 40) / 15;
        } else if (simulation.plantHealth > 20) {
            simulation.growthRate = 0.5;
        } else {
            simulation.growthRate = 0;
        }
        
        // Update plant height based on growth rate if plant is alive
        if (simulation.plantHealth > 0) {
            simulation.plantHeight += simulation.growthRate;
        }
        
        // Drain resources
        simulation.waterLevel = Math.max(0, simulation.waterLevel - simulation.drainRate * (1 + simulation.growthRate / 2));
        simulation.nutrientLevel = Math.max(0, simulation.nutrientLevel - simulation.nutrientUseRate * (1 + simulation.growthRate / 2));
        
        // Update plant status based on health and height
        updatePlantStatus();
        
        // Check if plant is dead
        if (simulation.plantHealth <= 0) {
            simulation.isAlive = false;
            simulation.status = 'Dead';
            message = "Your plant has died! Please reset the simulation to start over.";
            break;
        }
    }
    
    // If no specific message was set and the plant is alive, show a generic success message
    if (!message && simulation.isAlive) {
        if (simulation.plantHealth > 80) {
            message = "Your plant is thriving! Keep up the good work.";
        } else if (simulation.plantHealth > 50) {
            message = "Your plant is growing, but could use better care.";
        } else {
            message = "Your plant is struggling. Adjust the conditions to help it recover.";
        }
    }
    
    statusText.textContent = message;
    updateSimulationStats();
    draw();
}

// Update plant status based on health and height
function updatePlantStatus() {
    if (!simulation.isAlive) {
        simulation.status = 'Dead';
        return;
    }
    
    if (simulation.plantHealth < 30) {
        simulation.status = 'Dying';
    } else if (simulation.plantHeight >= 50) {
        simulation.status = 'Mature';
    } else if (simulation.plantHeight >= 10) {
        simulation.status = 'Growing';
    } else {
        simulation.status = 'Seedling';
    }
}

// Update simulation statistics display
function updateSimulationStats() {
    currentDayElement.textContent = simulation.currentDay;
    plantHeightElement.textContent = simulation.plantHeight.toFixed(1) + ' cm';
    plantHealthElement.textContent = simulation.plantHealth.toFixed(0) + '%';
    waterLevelElement.textContent = simulation.waterLevel.toFixed(1) + '%';
    nutrientLevelElement.textContent = simulation.nutrientLevel.toFixed(1) + '%';
    plantStatusElement.textContent = simulation.status;
    
    // Change color based on health
    if (simulation.plantHealth > 70) {
        plantHealthElement.style.color = 'var(--color-plant)';
    } else if (simulation.plantHealth > 40) {
        plantHealthElement.style.color = 'var(--color-plant-dark)';
    } else if (simulation.plantHealth > 20) {
        plantHealthElement.style.color = 'var(--color-plant-dying)';
    } else {
        plantHealthElement.style.color = 'var(--color-plant-dead)';
    }
}

// Water animation
function createWaterAnimation(intensity) {
    const dropCount = Math.floor(intensity / 10);
    
    for (let i = 0; i < dropCount; i++) {
        waterDrops.push({
            x: 150 + Math.random() * 100,
            y: 50,
            size: 3 + Math.random() * 3,
            speed: 2 + Math.random() * 3,
            opacity: 1
        });
    }
}

// Nutrient animation
function createNutrientAnimation(intensity) {
    const particleCount = Math.floor(intensity / 15);
    
    for (let i = 0; i < particleCount; i++) {
        nutrientParticles.push({
            x: 180 + Math.random() * 40,
            y: 350 + Math.random() * 40,
            size: 2 + Math.random() * 2,
            directionX: -1 + Math.random() * 2,
            directionY: -1 - Math.random(),
            opacity: 1,
            life: 100
        });
    }
}

// Light animation
function createLightAnimation(intensity) {
    lightBeams = [];
    const beamCount = Math.floor(intensity / 20) + 1;
    
    for (let i = 0; i < beamCount; i++) {
        lightBeams.push({
            x: 100 + Math.random() * 200,
            width: 10 + Math.random() * 20,
            opacity: 0.1 + Math.random() * 0.2
        });
    }
}

// Main draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background elements
    drawHydroponicSystem();
    
    // Draw animations
    updateAndDrawWater();
    updateAndDrawNutrients();
    drawLightBeams();
    
    // Draw plant
    drawPlant();
    
    // Request next frame
    requestAnimationFrame(draw);
}

// Draw the hydroponic system
function drawHydroponicSystem() {
    // Draw water reservoir
    ctx.fillStyle = '#e6e6e6';
    ctx.fillRect(50, 400, 300, 80);
    
    // Draw water
    ctx.fillStyle = 'rgba(75, 179, 253, 0.6)';
    ctx.fillRect(60, 410, 280, 60);
    
    // Draw pipe
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(190, 50, 20, 30);
    
    // Draw growing medium
    ctx.fillStyle = '#C8A887';
    ctx.beginPath();
    ctx.ellipse(200, 370, 80, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw plant pot
    ctx.fillStyle = '#A87545';
    ctx.beginPath();
    ctx.moveTo(120, 370);
    ctx.lineTo(140, 430);
    ctx.lineTo(260, 430);
    ctx.lineTo(280, 370);
    ctx.fill();
}

// Update and draw water drops
function updateAndDrawWater() {
    for (let i = waterDrops.length - 1; i >= 0; i--) {
        const drop = waterDrops[i];
        
        // Update position
        drop.y += drop.speed;
        drop.opacity -= 0.01;
        
        // Draw drop
        ctx.fillStyle = `rgba(75, 179, 253, ${drop.opacity})`;
        ctx.beginPath();
        ctx.ellipse(drop.x, drop.y, drop.size, drop.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Remove drops that are no longer visible
        if (drop.y > 370 || drop.opacity <= 0) {
            waterDrops.splice(i, 1);
        }
    }
}

// Update and draw nutrients
function updateAndDrawNutrients() {
    for (let i = nutrientParticles.length - 1; i >= 0; i--) {
        const particle = nutrientParticles[i];
        
        // Update position
        particle.x += particle.directionX;
        particle.y += particle.directionY;
        particle.life -= 1;
        particle.opacity = particle.life / 100;
        
        // Draw particle
        ctx.fillStyle = `rgba(214, 158, 48, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Remove particles that are no longer visible
        if (particle.life <= 0) {
            nutrientParticles.splice(i, 1);
        }
    }
}

// Draw light beams
function drawLightBeams() {
    for (const beam of lightBeams) {
        // Create gradient for light beam
        const gradient = ctx.createLinearGradient(beam.x, 0, beam.x + beam.width, 0);
        gradient.addColorStop(0, `rgba(255, 255, 200, 0)`);
        gradient.addColorStop(0.5, `rgba(255, 255, 200, ${beam.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 200, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(beam.x, 0, beam.width, canvas.height);
    }
}

// Draw plant based on health and growth
// Draw plant based on health and growth
function drawPlant() {
    if (simulation.plantHeight <= 0) return;
    
    let plantColor;
    
    // Determine plant color based on health
    if (simulation.isAlive) {
        if (simulation.plantHealth > 70) {
            plantColor = '#4CAF50'; // Bright green, replace var(--color-plant)
        } else if (simulation.plantHealth > 40) {
            plantColor = '#2E7D32'; // Dark green, replace var(--color-plant-dark)
        } else {
            plantColor = '#8B6914'; // Brownish-yellow, replace var(--color-plant-dying)
        }
    } else {
        plantColor = '#795548'; // Brown, replace var(--color-plant-dead)
    }
    
    const stemHeight = Math.min(300, simulation.plantHeight * 4);
    
    // Draw stem
    ctx.fillStyle = plantColor;
    ctx.fillRect(197, 370 - stemHeight, 6, stemHeight);
    
    // Draw leaves based on growth
    if (simulation.plantHeight >= 5) {
        // First set of leaves
        drawLeaf(200, 370 - stemHeight * 0.2, -30, 20, plantColor);
        drawLeaf(200, 370 - stemHeight * 0.2, 30, 20, plantColor);
    }

    if (simulation.plantHeight >= 15) {
        // Second set of leaves
        drawLeaf(200, 370 - stemHeight * 0.5, -40, 25, plantColor);
        drawLeaf(200, 370 - stemHeight * 0.5, 40, 25, plantColor);
    }

    if (simulation.plantHeight >= 30) {
        // Third set of leaves
        drawLeaf(200, 370 - stemHeight * 0.7, -50, 30, plantColor);
        drawLeaf(200, 370 - stemHeight * 0.7, 50, 30, plantColor);
    }

    // Draw flower or fruit if mature
    if (simulation.status === 'Mature' && simulation.plantHealth > 50) {
        // Draw flower
        ctx.fillStyle = '#FF9900';
        ctx.beginPath();
        ctx.arc(200, 370 - stemHeight - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw flower center
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath();
        ctx.arc(200, 370 - stemHeight - 10, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Function to draw a leaf
function drawLeaf(x, y, angle, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(size/2, 0, size, size/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Initialize the simulation when the page loads
window.onload = function() {
    init();
    statusText.textContent = "Welcome to the Hydroponics Simulation! Adjust the sliders and simulate days to grow your plant.";
};

// Start the simulation
init();