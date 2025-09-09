const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('.'));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Calculator endpoint
app.post('/calculate', (req, res) => {
    try {
        const {
            height,
            weight,
            age,
            gender,
            activityLevel,
            days,
            hours,
            goal = 'maintain'
        } = req.body;

        // Validate input
        const h = parseFloat(height);
        const w = parseFloat(weight);
        const a = parseInt(age);
        const al = parseFloat(activityLevel);
        const d = parseInt(days);
        const hr = parseFloat(hours);

        if (h < 100 || h > 250) throw new Error('Height must be between 100 and 250 cm');
        if (w < 30 || w > 300) throw new Error('Weight must be between 30 and 300 kg');
        if (a < 15 || a > 100) throw new Error('Age must be between 15 and 100 years');
        if (d < 1 || d > 7) throw new Error('Days must be between 1 and 7');
        if (hr < 0.5 || hr > 4) throw new Error('Hours must be between 0.5 and 4');

        // Calculate BMR using Mifflin-St Jeor equation
        const baseBMR = (10 * w) + (6.25 * h) - (5 * a);
        const bmr = gender === 'male' ? baseBMR + 5 : baseBMR - 161;
        
        // Calculate maintenance and target calories
        const maintenanceCalories = Math.round(bmr * al);
        let targetCalories = maintenanceCalories;
        
        if (goal === 'lose') targetCalories = maintenanceCalories - 500;
        else if (goal === 'gain') targetCalories = maintenanceCalories + 500;

        // Calculate BMI
        const heightInMeters = h / 100;
        const bmi = w / (heightInMeters * heightInMeters);

        // Generate workout plan
        const workoutPlan = generateWorkoutPlan(d, hr);

        // Calculate macronutrients
        const macros = calculateMacronutrients(targetCalories);

        // Generate and send results page
        const resultsHTML = generateResultsPage({
            bmr: Math.round(bmr),
            maintenanceCalories,
            targetCalories,
            goal,
            bmi: parseFloat(bmi.toFixed(1)),
            workoutPlan,
            macros,
            gender,
            height: h,
            weight: w,
            age: a
        });

        res.send(resultsHTML);

    } catch (error) {
        const errorHTML = generateErrorPage(error.message);
        res.status(400).send(errorHTML);
    }
});

function generateWorkoutPlan(days, hours) {
    const plans = {
        1: {
            name: "Full Body Blast",
            description: "A comprehensive full-body workout that targets all major muscle groups in one intense session. Perfect for busy schedules while ensuring balanced development."
        },
        2: {
            name: "Push-Pull Split",
            description: "An efficient 2-day split focusing on pushing movements (chest, shoulders, triceps) and pulling movements (back, biceps) with legs incorporated throughout."
        },
        3: {
            name: "Push-Pull-Legs (PPL)",
            description: "The classic 3-day split that separates pushing muscles, pulling muscles, and legs. Provides excellent balance between intensity and recovery."
        },
        4: {
            name: "Upper/Lower Split",
            description: "A 4-day program alternating between upper body and lower body sessions. Allows for higher training frequency and volume for faster results."
        },
        5: {
            name: "Arnold Split",
            description: "An advanced 5-day split popularized by Arnold Schwarzenegger. Combines muscle groups strategically for maximum growth and definition."
        }
    };

    return plans[days] || {
        name: "Advanced Bro Split",
        description: "A high-frequency split dedicating individual days to specific muscle groups. Ideal for advanced trainees seeking maximum muscle specialization."
    };
}

function calculateMacronutrients(targetCalories) {
    return {
        protein: Math.round(targetCalories * 0.30 / 4),
        carbs: Math.round(targetCalories * 0.35 / 4),
        fat: Math.round(targetCalories * 0.35 / 9)
    };
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

function generateResultsPage(data) {
    const goalStyles = {
        lose: { color: 'danger', icon: 'arrow-down', text: 'Weight Loss Goal' },
        maintain: { color: 'success', icon: 'equals', text: 'Weight Maintenance' },
        gain: { color: 'info', icon: 'arrow-up', text: 'Weight Gain Goal' }
    };

    const goalStyle = goalStyles[data.goal] || goalStyles.maintain;
    const bmiCategory = getBMICategory(data.bmi);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Results - Maintenance Calories Calculator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-gradient-primary fixed-top shadow-lg">
        <div class="container">
            <a class="navbar-brand fw-bold" href="/">
                <i class="fas fa-calculator me-2"></i>Maintenance Calories Calculator
            </a>
            <div class="navbar-nav ms-auto">
                <a href="/" class="btn btn-outline-light btn-sm rounded-pill">
                    <i class="fas fa-arrow-left me-1"></i>Calculate Again
                </a>
            </div>
        </div>
    </nav>

    <!-- Results Hero -->
    <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="container hero-content">
            <div class="text-center">
                <h1 class="display-4 fw-bold text-white mb-4">
                    Your <span class="text-accent">Personalized</span> Results
                </h1>
                <p class="lead text-white mb-4">
                    Based on your inputs, here's your customized fitness and nutrition plan
                </p>
                <div class="success-badge">
                    <i class="fas fa-check-circle fa-2x text-success me-2"></i>
                    <span class="text-white">Calculation Complete!</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Results Section -->
    <section class="py-5 bg-light">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="row g-4">
                        <!-- Calorie Results -->
                        <div class="col-lg-6">
                            <div class="result-card shadow-sm h-100">
                                <div class="card-header bg-primary text-white">
                                    <h5 class="mb-0">
                                        <i class="fas fa-fire me-2"></i>Calorie Breakdown
                                    </h5>
                                </div>
                                <div class="card-body">
                                    <div class="alert alert-${goalStyle.color} text-center mb-4">
                                        <i class="fas fa-${goalStyle.icon} me-2"></i>
                                        <strong>${goalStyle.text}</strong>
                                    </div>
                                    
                                    <div class="row g-3 mb-4">
                                        <div class="col-md-6">
                                            <div class="stat-box text-center p-3 bg-light rounded">
                                                <div class="stat-number text-primary fs-2 fw-bold">${data.bmr}</div>
                                                <div class="stat-label fw-semibold">Basal Metabolic Rate</div>
                                                <small class="text-muted">Calories burned at rest</small>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="stat-box text-center p-3 bg-light rounded">
                                                <div class="stat-number text-success fs-2 fw-bold">${data.maintenanceCalories}</div>
                                                <div class="stat-label fw-semibold">Maintenance Calories</div>
                                                <small class="text-muted">To maintain current weight</small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="target-calories">
                                        <h4 class="text-${goalStyle.color} mb-3 text-center">
                                            <i class="fas fa-target me-2"></i>Your Target: ${data.targetCalories} calories/day
                                        </h4>
                                        <div class="row g-2">
                                            <div class="col-md-4">
                                                <div class="mini-stat bg-danger-subtle text-center p-2 rounded">
                                                    <strong>${data.maintenanceCalories - 500}</strong>
                                                    <small class="d-block">Weight Loss</small>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="mini-stat bg-success-subtle text-center p-2 rounded">
                                                    <strong>${data.maintenanceCalories}</strong>
                                                    <small class="d-block">Maintenance</small>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="mini-stat bg-info-subtle text-center p-2 rounded">
                                                    <strong>${data.maintenanceCalories + 500}</strong>
                                                    <small class="d-block">Weight Gain</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-4">
                                        <div class="bmi-info p-3 bg-light rounded text-center">
                                            <strong>Your BMI: ${data.bmi}</strong>
                                            <small class="d-block text-muted">${bmiCategory}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Workout Plan -->
                        <div class="col-lg-6">
                            <div class="result-card shadow-sm h-100">
                                <div class="card-header bg-success text-white">
                                    <h5 class="mb-0">
                                        <i class="fas fa-dumbbell me-2"></i>Recommended Workout Plan
                                    </h5>
                                </div>
                                <div class="card-body">
                                    <h4 class="text-success mb-3">
                                        <i class="fas fa-star me-2"></i>${data.workoutPlan.name}
                                    </h4>
                                    <p class="text-muted mb-4">${data.workoutPlan.description}</p>
                                    
                                    <div class="workout-benefits mb-4">
                                        <h6 class="text-primary mb-3">Benefits of This Plan:</h6>
                                        <ul class="list-unstyled">
                                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Optimized for your schedule</li>
                                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Progressive muscle development</li>
                                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Balanced recovery time</li>
                                        </ul>
                                    </div>
                                    
                                    <div class="workout-tips">
                                        <h6 class="text-primary mb-3">Success Tips:</h6>
                                        <ul class="small text-muted mb-0">
                                            <li class="mb-1">Start with lighter weights and focus on form</li>
                                            <li class="mb-1">Progressive overload: gradually increase weight/reps</li>
                                            <li class="mb-1">Allow 48-72 hours rest between training same muscles</li>
                                            <li class="mb-1">Stay consistent with your schedule</li>
                                            <li class="mb-1">Track your workouts for better progress</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Macronutrient Breakdown -->
                        <div class="col-12">
                            <div class="result-card shadow-sm">
                                <div class="card-header bg-info text-white">
                                    <h5 class="mb-0">
                                        <i class="fas fa-utensils me-2"></i>Daily Macronutrient Targets
                                    </h5>
                                </div>
                                <div class="card-body">
                                    <div class="row text-center">
                                        <div class="col-md-4">
                                            <div class="macro-card p-4">
                                                <div class="macro-icon bg-danger text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                                                    <i class="fas fa-drumstick-bite"></i>
                                                </div>
                                                <h5 class="text-danger">Protein</h5>
                                                <div class="macro-amount fs-3 fw-bold">${data.macros.protein}g</div>
                                                <small class="text-muted">30% of total calories</small>
                                                <div class="progress mt-2">
                                                    <div class="progress-bar bg-danger" style="width: 30%"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="macro-card p-4">
                                                <div class="macro-icon bg-warning text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                                                    <i class="fas fa-bread-slice"></i>
                                                </div>
                                                <h5 class="text-warning">Carbohydrates</h5>
                                                <div class="macro-amount fs-3 fw-bold">${data.macros.carbs}g</div>
                                                <small class="text-muted">35% of total calories</small>
                                                <div class="progress mt-2">
                                                    <div class="progress-bar bg-warning" style="width: 35%"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="macro-card p-4">
                                                <div class="macro-icon bg-success text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                                                    <i class="fas fa-olive-branch"></i>
                                                </div>
                                                <h5 class="text-success">Fats</h5>
                                                <div class="macro-amount fs-3 fw-bold">${data.macros.fat}g</div>
                                                <small class="text-muted">35% of total calories</small>
                                                <div class="progress mt-2">
                                                    <div class="progress-bar bg-success" style="width: 35%"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center mt-5">
                        <a href="/" class="btn btn-accent btn-lg rounded-pill px-5">
                            <i class="fas fa-calculator me-2"></i>Calculate Again
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

function generateErrorPage(message) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Error - Maintenance Calories Calculator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="alert alert-danger text-center">
                    <h3><i class="fas fa-exclamation-triangle me-2"></i>Error</h3>
                    <p class="mb-3">${message}</p>
                    <a href="/" class="btn btn-primary">
                        <i class="fas fa-arrow-left me-2"></i>Go Back
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maintenance Calories Calculator server running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
});