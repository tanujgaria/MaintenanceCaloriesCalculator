// Global variables
let calorieChart = null;
let macroChart = null;

// DOM elements
const form = document.getElementById('calorieForm');
const resultsSection = document.getElementById('results-section');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeAnimations();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmission);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Real-time form validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidationOnType);
    });
}

// Initialize animations
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.diet-card, .protein-card, .stat-card, .result-card').forEach(el => {
        observer.observe(el);
    });
}

// Handle form submission
function handleFormSubmission(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    showLoadingState();

    try {
        const formData = getFormData();
        const results = calculateResults(formData);
        displayResults(results);
        scrollToResults();
    } catch (error) {
        showError('An error occurred while calculating your results. Please try again.');
        console.error('Calculation error:', error);
    } finally {
        hideLoadingState();
    }
}

// Get form data
function getFormData() {
    return {
        height: parseFloat(document.getElementById('height').value),
        weight: parseFloat(document.getElementById('weight').value),
        age: parseFloat(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        activityLevel: parseFloat(document.getElementById('activityLevel').value),
        days: parseInt(document.getElementById('days').value),
        hours: parseFloat(document.getElementById('hours').value),
        goal: getSelectedGoal()
    };
}

// Get selected goal
function getSelectedGoal() {
    const goalRadios = document.getElementsByName('goal');
    for (let radio of goalRadios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return 'maintain'; // default
}

// Calculate all results
function calculateResults(data) {
    const bmr = calculateBMR(data.height, data.weight, data.age, data.gender);
    const maintenanceCalories = Math.round(bmr * data.activityLevel);
    
    let targetCalories;
    let calorieAdjustment;
    
    switch (data.goal) {
        case 'lose':
            targetCalories = maintenanceCalories - 500;
            calorieAdjustment = -500;
            break;
        case 'gain':
            targetCalories = maintenanceCalories + 500;
            calorieAdjustment = +500;
            break;
        default:
            targetCalories = maintenanceCalories;
            calorieAdjustment = 0;
    }

    const macros = calculateMacros(targetCalories);
    const workoutPlan = generateWorkoutPlan(data.days, data.hours);
    
    return {
        bmr: Math.round(bmr),
        maintenanceCalories,
        targetCalories,
        calorieAdjustment,
        goal: data.goal,
        macros,
        workoutPlan,
        bmi: calculateBMI(data.height, data.weight)
    };
}

// Calculate BMR using Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
function calculateBMR(height, weight, age, gender) {
    const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
    return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}

// Calculate BMI
function calculateBMI(height, weight) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(1));
}

// Calculate macronutrient distribution
function calculateMacros(calories) {
    // Standard macro distribution: 30% protein, 35% carbs, 35% fat
    const proteinCalories = calories * 0.30;
    const carbCalories = calories * 0.35;
    const fatCalories = calories * 0.35;

    return {
        protein: {
            grams: Math.round(proteinCalories / 4),
            calories: Math.round(proteinCalories),
            percentage: 30
        },
        carbs: {
            grams: Math.round(carbCalories / 4),
            calories: Math.round(carbCalories),
            percentage: 35
        },
        fat: {
            grams: Math.round(fatCalories / 9),
            calories: Math.round(fatCalories),
            percentage: 35
        }
    };
}

// Generate workout plan
function generateWorkoutPlan(days, hours) {
    const plans = {
        1: {
            name: "Full Body Blast",
            description: "Complete full-body workout hitting all major muscle groups",
            exercises: ["Squats", "Deadlifts", "Push-ups", "Pull-ups", "Planks"],
            duration: `${hours} hour${hours !== 1 ? 's' : ''}`
        },
        2: {
            name: "Push-Pull Split",
            description: "Efficient 2-day split focusing on pushing and pulling movements",
            exercises: ["Day 1: Push (Chest, Shoulders, Triceps)", "Day 2: Pull (Back, Biceps) + Legs"],
            duration: `${hours} hour${hours !== 1 ? 's' : ''} per session`
        },
        3: {
            name: "Push-Pull-Legs",
            description: "Classic 3-day split for balanced muscle development",
            exercises: ["Day 1: Push (Chest, Shoulders, Triceps)", "Day 2: Pull (Back, Biceps)", "Day 3: Legs & Core"],
            duration: `${hours} hour${hours !== 1 ? 's' : ''} per session`
        },
        4: {
            name: "Upper/Lower Split",
            description: "4-day program alternating between upper and lower body",
            exercises: ["Day 1 & 3: Upper Body", "Day 2 & 4: Lower Body"],
            duration: `${hours} hour${hours !== 1 ? 's' : ''} per session`
        },
        5: {
            name: "Arnold Split",
            description: "Advanced 5-day split for serious muscle building",
            exercises: ["Chest/Back", "Shoulders/Arms", "Legs", "Chest/Back", "Shoulders/Arms"],
            duration: `${hours} hour${hours !== 1 ? 's' : ''} per session`
        }
    };

    return plans[days] || {
        name: "Bro Split",
        description: "Advanced 6+ day split with dedicated muscle group days",
        exercises: ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"],
        duration: `${hours} hour${hours !== 1 ? 's' : ''} per session`
    };
}

// Display results
function displayResults(results) {
    displayCalorieResults(results);
    displayWorkoutResults(results);
    displayMacroResults(results);
    resultsSection.style.display = 'block';
}

// Display calorie results
function displayCalorieResults(results) {
    const goalLabels = {
        lose: { text: 'Weight Loss Goal', color: 'danger', icon: 'arrow-down' },
        maintain: { text: 'Weight Maintenance', color: 'success', icon: 'equals' },
        gain: { text: 'Weight Gain Goal', color: 'info', icon: 'arrow-up' }
    };

    const goalInfo = goalLabels[results.goal];
    
    document.getElementById('calorie-results').innerHTML = `
        <div class="row g-3">
            <div class="col-12">
                <div class="alert alert-${goalInfo.color} text-center">
                    <i class="fas fa-${goalInfo.icon} me-2"></i>
                    <strong>${goalInfo.text}</strong>
                </div>
            </div>
            <div class="col-md-6">
                <div class="stat-box">
                    <div class="stat-number text-primary">${results.bmr}</div>
                    <div class="stat-label">Basal Metabolic Rate</div>
                    <small class="text-muted">Calories burned at rest</small>
                </div>
            </div>
            <div class="col-md-6">
                <div class="stat-box">
                    <div class="stat-number text-success">${results.maintenanceCalories}</div>
                    <div class="stat-label">Maintenance Calories</div>
                    <small class="text-muted">To maintain current weight</small>
                </div>
            </div>
            <div class="col-12">
                <div class="target-calories">
                    <h4 class="text-${goalInfo.color} mb-3">
                        <i class="fas fa-target me-2"></i>Your Target: ${results.targetCalories} calories/day
                    </h4>
                    <div class="row g-2">
                        <div class="col-md-4">
                            <div class="mini-stat bg-danger-subtle">
                                <strong>${results.maintenanceCalories - 500}</strong>
                                <small>Weight Loss</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mini-stat bg-success-subtle">
                                <strong>${results.maintenanceCalories}</strong>
                                <small>Maintenance</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mini-stat bg-info-subtle">
                                <strong>${results.maintenanceCalories + 500}</strong>
                                <small>Weight Gain</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 mt-3">
                <div class="bmi-info p-3 bg-light rounded">
                    <strong>Your BMI: ${results.bmi}</strong>
                    <small class="d-block text-muted">${getBMICategory(results.bmi)}</small>
                </div>
            </div>
        </div>
    `;
}

// Display workout results
function displayWorkoutResults(results) {
    document.getElementById('workout-results').innerHTML = `
        <div class="workout-plan">
            <h4 class="text-success mb-3">
                <i class="fas fa-dumbbell me-2"></i>${results.workoutPlan.name}
            </h4>
            <p class="text-muted mb-3">${results.workoutPlan.description}</p>
            
            <div class="workout-details">
                <div class="mb-3">
                    <strong>Duration:</strong> ${results.workoutPlan.duration}
                </div>
                
                <div class="mb-3">
                    <strong>Focus Areas:</strong>
                    <ul class="list-unstyled mt-2">
                        ${results.workoutPlan.exercises.map(exercise => 
                            `<li class="mb-1"><i class="fas fa-check text-success me-2"></i>${exercise}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="workout-tips">
                    <h6 class="text-primary">Pro Tips:</h6>
                    <ul class="small text-muted">
                        <li>Warm up for 5-10 minutes before starting</li>
                        <li>Focus on proper form over heavy weights</li>
                        <li>Rest 48-72 hours between training same muscle groups</li>
                        <li>Stay hydrated throughout your workout</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Display macro results
function displayMacroResults(results) {
    document.getElementById('macro-results').innerHTML = `
        <div class="col-md-4">
            <div class="macro-card text-center">
                <div class="macro-icon bg-danger text-white">
                    <i class="fas fa-drumstick-bite"></i>
                </div>
                <h5 class="mt-3">Protein</h5>
                <div class="macro-amount">${results.macros.protein.grams}g</div>
                <small class="text-muted">${results.macros.protein.calories} calories (${results.macros.protein.percentage}%)</small>
                <div class="progress mt-2">
                    <div class="progress-bar bg-danger" style="width: ${results.macros.protein.percentage}%"></div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="macro-card text-center">
                <div class="macro-icon bg-warning text-white">
                    <i class="fas fa-bread-slice"></i>
                </div>
                <h5 class="mt-3">Carbohydrates</h5>
                <div class="macro-amount">${results.macros.carbs.grams}g</div>
                <small class="text-muted">${results.macros.carbs.calories} calories (${results.macros.carbs.percentage}%)</small>
                <div class="progress mt-2">
                    <div class="progress-bar bg-warning" style="width: ${results.macros.carbs.percentage}%"></div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="macro-card text-center">
                <div class="macro-icon bg-success text-white">
                    <i class="fas fa-olive-branch"></i>
                </div>
                <h5 class="mt-3">Fats</h5>
                <div class="macro-amount">${results.macros.fat.grams}g</div>
                <small class="text-muted">${results.macros.fat.calories} calories (${results.macros.fat.percentage}%)</small>
                <div class="progress mt-2">
                    <div class="progress-bar bg-success" style="width: ${results.macros.fat.percentage}%"></div>
                </div>
            </div>
        </div>
    `;
}

// Get BMI category
function getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

// Form validation functions
function validateForm() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseFloat(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activityLevel = parseFloat(document.getElementById('activityLevel').value);
    const days = parseInt(document.getElementById('days').value);
    const hours = parseFloat(document.getElementById('hours').value);

    if (!height || height < 100 || height > 250) {
        showError('Please enter a valid height between 100 and 250 cm.');
        return false;
    }
    if (!weight || weight < 30 || weight > 300) {
        showError('Please enter a valid weight between 30 and 300 kg.');
        return false;
    }
    if (!age || age < 15 || age > 100) {
        showError('Please enter a valid age between 15 and 100 years.');
        return false;
    }
    if (!gender) {
        showError('Please select your gender.');
        return false;
    }
    if (!activityLevel) {
        showError('Please select your activity level.');
        return false;
    }
    if (!days || days < 1 || days > 7) {
        showError('Please enter valid days available (1-7).');
        return false;
    }
    if (!hours || hours < 0.5 || hours > 4) {
        showError('Please enter valid hours per day (0.5-4).');
        return false;
    }

    return true;
}

function validateField(event) {
    const field = event.target;
    const value = field.value;
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        return false;
    }
    
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    return true;
}

function clearValidationOnType(event) {
    const field = event.target;
    field.classList.remove('is-invalid', 'is-valid');
}

// Utility functions
function showLoadingState() {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Calculating...';
}

function hideLoadingState() {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-calculator me-2"></i>Calculate My Calories & Get Workout Plan';
}

function showError(message) {
    alert(message); // Simple alert for now - could be enhanced with a toast notification
}

function scrollToResults() {
    resultsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToCalculator() {
    document.getElementById('calculator').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}