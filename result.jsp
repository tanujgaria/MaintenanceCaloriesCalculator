<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.text.DecimalFormat" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Results - Maintenance Calories Calculator</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="static_style.css">
</head>
<body>
    <%
        // Get calculation results from request attributes
        Integer maintenanceCalories = (Integer) request.getAttribute("maintenanceCalories");
        Integer bmr = (Integer) request.getAttribute("bmr");
        Integer targetCalories = (Integer) request.getAttribute("targetCalories");
        String goal = (String) request.getAttribute("goal");
        Double bmi = (Double) request.getAttribute("bmi");
        String workoutPlan = (String) request.getAttribute("workoutPlan");
        String workoutDescription = (String) request.getAttribute("workoutDescription");
        Integer proteinGrams = (Integer) request.getAttribute("proteinGrams");
        Integer carbGrams = (Integer) request.getAttribute("carbGrams");
        Integer fatGrams = (Integer) request.getAttribute("fatGrams");
        String gender = (String) request.getAttribute("gender");
        Double height = (Double) request.getAttribute("height");
        Double weight = (Double) request.getAttribute("weight");
        Integer age = (Integer) request.getAttribute("age");
        
        // Default values if attributes are null
        if (maintenanceCalories == null) maintenanceCalories = 2000;
        if (bmr == null) bmr = 1600;
        if (targetCalories == null) targetCalories = maintenanceCalories;
        if (goal == null) goal = "maintain";
        if (bmi == null) bmi = 23.0;
        if (workoutPlan == null) workoutPlan = "Full Body Workout";
        if (workoutDescription == null) workoutDescription = "Complete workout plan for your fitness goals";
        if (proteinGrams == null) proteinGrams = 150;
        if (carbGrams == null) carbGrams = 175;
        if (fatGrams == null) fatGrams = 78;
        if (gender == null) gender = "unspecified";
        if (height == null) height = 170.0;
        if (weight == null) weight = 70.0;
        if (age == null) age = 25;
        
        DecimalFormat df = new DecimalFormat("#.#");
        
        // Determine goal styling
        String goalColor = "success";
        String goalIcon = "equals";
        String goalText = "Weight Maintenance";
        
        if ("lose".equals(goal)) {
            goalColor = "danger";
            goalIcon = "arrow-down";
            goalText = "Weight Loss Goal";
        } else if ("gain".equals(goal)) {
            goalColor = "info";
            goalIcon = "arrow-up";
            goalText = "Weight Gain Goal";
        }
        
        // BMI category
        String bmiCategory = "Normal weight";
        if (bmi < 18.5) bmiCategory = "Underweight";
        else if (bmi >= 25 && bmi < 30) bmiCategory = "Overweight";
        else if (bmi >= 30) bmiCategory = "Obese";
    %>

    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-gradient-primary fixed-top shadow-lg">
        <div class="container">
            <a class="navbar-brand fw-bold" href="static_index.html">
                <i class="fas fa-calculator me-2"></i>
                Maintenance Calories Calculator
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="static_index.html"><i class="fas fa-home me-1"></i>Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="#"><i class="fas fa-chart-line me-1"></i>Results</a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a href="static_index.html" class="btn btn-outline-light btn-sm rounded-pill">
                            <i class="fas fa-arrow-left me-1"></i>Calculate Again
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Results Hero Section -->
    <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="container hero-content">
            <div class="row justify-content-center text-center">
                <div class="col-lg-8">
                    <h1 class="display-4 fw-bold text-white mb-4 animate-fade-in">
                        Your <span class="text-accent">Personalized</span> Results
                    </h1>
                    <p class="lead text-white mb-4 animate-fade-in-delay">
                        Based on your inputs, here's your customized fitness and nutrition plan
                    </p>
                    <div class="success-badge animate-fade-in-delay-2">
                        <i class="fas fa-check-circle fa-2x text-success me-2"></i>
                        <span class="text-white">Calculation Complete!</span>
                    </div>
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
                                    <div class="alert alert-<%= goalColor %> text-center mb-4">
                                        <i class="fas fa-<%= goalIcon %> me-2"></i>
                                        <strong><%= goalText %></strong>
                                    </div>
                                    
                                    <div class="row g-3 mb-4">
                                        <div class="col-md-6">
                                            <div class="stat-box">
                                                <div class="stat-number text-primary"><%= bmr %></div>
                                                <div class="stat-label">Basal Metabolic Rate</div>
                                                <small class="text-muted">Calories burned at rest</small>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="stat-box">
                                                <div class="stat-number text-success"><%= maintenanceCalories %></div>
                                                <div class="stat-label">Maintenance Calories</div>
                                                <small class="text-muted">To maintain current weight</small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="target-calories">
                                        <h4 class="text-<%= goalColor %> mb-3">
                                            <i class="fas fa-target me-2"></i>Your Target: <%= targetCalories %> calories/day
                                        </h4>
                                        <div class="row g-2">
                                            <div class="col-md-4">
                                                <div class="mini-stat bg-danger-subtle">
                                                    <strong><%= maintenanceCalories - 500 %></strong>
                                                    <small>Weight Loss</small>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="mini-stat bg-success-subtle">
                                                    <strong><%= maintenanceCalories %></strong>
                                                    <small>Maintenance</small>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="mini-stat bg-info-subtle">
                                                    <strong><%= maintenanceCalories + 500 %></strong>
                                                    <small>Weight Gain</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-4">
                                        <div class="bmi-info p-3 bg-light rounded">
                                            <strong>Your BMI: <%= df.format(bmi) %></strong>
                                            <small class="d-block text-muted"><%= bmiCategory %></small>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-4">
                                        <canvas id="calorieChart" width="400" height="200"></canvas>
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
                                    <div class="workout-plan">
                                        <h4 class="text-success mb-3">
                                            <i class="fas fa-star me-2"></i><%= workoutPlan %>
                                        </h4>
                                        <p class="text-muted mb-4"><%= workoutDescription %></p>
                                        
                                        <div class="workout-benefits mb-4">
                                            <h6 class="text-primary mb-3">Benefits of This Plan:</h6>
                                            <ul class="list-unstyled">
                                                <% if (workoutPlan.contains("Full Body")) { %>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Targets all major muscle groups</li>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Perfect for beginners</li>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Time-efficient workouts</li>
                                                <% } else if (workoutPlan.contains("Push-Pull")) { %>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Balanced muscle development</li>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Adequate recovery time</li>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Progressive overload friendly</li>
                                                <% } else if (workoutPlan.contains("Upper/Lower")) { %>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Higher training frequency</li>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Great for strength gains</li>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Flexible scheduling</li>
                                                <% } else { %>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Advanced muscle targeting</li>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>High training volume</li>
                                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Specialized development</li>
                                                <% } %>
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
                                            <div class="macro-card">
                                                <div class="macro-icon bg-danger text-white">
                                                    <i class="fas fa-drumstick-bite"></i>
                                                </div>
                                                <h5 class="mt-3 text-danger">Protein</h5>
                                                <div class="macro-amount"><%= proteinGrams %>g</div>
                                                <small class="text-muted"><%= Math.round(proteinGrams * 4) %> calories (30%)</small>
                                                <div class="progress mt-2">
                                                    <div class="progress-bar bg-danger" style="width: 30%"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="macro-card">
                                                <div class="macro-icon bg-warning text-white">
                                                    <i class="fas fa-bread-slice"></i>
                                                </div>
                                                <h5 class="mt-3 text-warning">Carbohydrates</h5>
                                                <div class="macro-amount"><%= carbGrams %>g</div>
                                                <small class="text-muted"><%= Math.round(carbGrams * 4) %> calories (35%)</small>
                                                <div class="progress mt-2">
                                                    <div class="progress-bar bg-warning" style="width: 35%"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="macro-card">
                                                <div class="macro-icon bg-success text-white">
                                                    <i class="fas fa-olive-branch"></i>
                                                </div>
                                                <h5 class="mt-3 text-success">Fats</h5>
                                                <div class="macro-amount"><%= fatGrams %>g</div>
                                                <small class="text-muted"><%= Math.round(fatGrams * 9) %> calories (35%)</small>
                                                <div class="progress mt-2">
                                                    <div class="progress-bar bg-success" style="width: 35%"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Personal Summary -->
                        <div class="col-12">
                            <div class="result-card shadow-sm">
                                <div class="card-header bg-secondary text-white">
                                    <h5 class="mb-0">
                                        <i class="fas fa-user me-2"></i>Your Profile Summary
                                    </h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <div class="text-center p-3">
                                                <h6 class="text-muted">Height</h6>
                                                <h4 class="text-primary"><%= df.format(height) %> cm</h4>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="text-center p-3">
                                                <h6 class="text-muted">Weight</h6>
                                                <h4 class="text-success"><%= df.format(weight) %> kg</h4>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="text-center p-3">
                                                <h6 class="text-muted">Age</h6>
                                                <h4 class="text-info"><%= age %> years</h4>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="text-center p-3">
                                                <h6 class="text-muted">Gender</h6>
                                                <h4 class="text-warning"><%= gender.substring(0,1).toUpperCase() + gender.substring(1) %></h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center mt-5">
                        <a href="static_index.html" class="btn btn-accent btn-lg rounded-pill px-5">
                            <i class="fas fa-calculator me-2"></i>Calculate Again
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Chart Script -->
    <script>
        // Create calorie breakdown chart
        const ctx = document.getElementById('calorieChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['BMR', 'Activity Calories'],
                datasets: [{
                    data: [<%= bmr %>, <%= maintenanceCalories - bmr %>],
                    backgroundColor: ['#3498db', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Daily Calorie Breakdown'
                    }
                }
            }
        });
    </script>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>