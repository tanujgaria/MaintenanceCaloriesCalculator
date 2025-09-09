import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.RequestDispatcher;
import java.io.IOException;
import java.text.DecimalFormat;

/**
 * Enhanced Calorie Calculator Servlet
 * Calculates BMR, maintenance calories, target calories, and provides workout recommendations
 * Uses Mifflin-St Jeor equation for more accurate BMR calculation
 */
@WebServlet("/calculate")
public class CalculatorServlet extends HttpServlet {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * Handles POST requests for calorie calculation
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        try {
            // Retrieve and validate form data
            PersonalData personalData = extractPersonalData(request);
            
            // Perform calculations
            CalorieResults results = calculateCalories(personalData);
            
            // Generate workout plan
            WorkoutPlan workoutPlan = generateWorkoutPlan(
                personalData.getDaysAvailable(), 
                personalData.getHoursPerDay()
            );
            
            // Calculate macronutrients
            MacroNutrients macros = calculateMacronutrients(results.getTargetCalories());
            
            // Set all attributes for JSP
            setResultAttributes(request, personalData, results, workoutPlan, macros);
            
            // Forward to result JSP
            RequestDispatcher dispatcher = request.getRequestDispatcher("result.jsp");
            dispatcher.forward(request, response);
            
        } catch (NumberFormatException e) {
            handleError(request, response, "Invalid input data. Please check your entries and try again.");
        } catch (IllegalArgumentException e) {
            handleError(request, response, e.getMessage());
        } catch (Exception e) {
            handleError(request, response, "An unexpected error occurred. Please try again.");
        }
    }
    
    /**
     * Handles GET requests by redirecting to the main page
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.sendRedirect("index.html");
    }
    
    /**
     * Extracts and validates personal data from request parameters
     */
    private PersonalData extractPersonalData(HttpServletRequest request) throws IllegalArgumentException {
        try {
            double height = Double.parseDouble(request.getParameter("height"));
            double weight = Double.parseDouble(request.getParameter("weight"));
            int age = Integer.parseInt(request.getParameter("age"));
            String gender = request.getParameter("gender");
            double activityLevel = Double.parseDouble(request.getParameter("activityLevel"));
            int daysAvailable = Integer.parseInt(request.getParameter("days"));
            double hoursPerDay = Double.parseDouble(request.getParameter("hours"));
            String goal = request.getParameter("goal");
            
            // Validate input ranges
            validateInputRanges(height, weight, age, daysAvailable, hoursPerDay);
            
            return new PersonalData(height, weight, age, gender, activityLevel, 
                                  daysAvailable, hoursPerDay, goal);
                                  
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid numeric input provided.");
        }
    }
    
    /**
     * Validates input ranges for safety and accuracy
     */
    private void validateInputRanges(double height, double weight, int age, 
                                   int daysAvailable, double hoursPerDay) throws IllegalArgumentException {
        if (height < 100 || height > 250) {
            throw new IllegalArgumentException("Height must be between 100 and 250 cm.");
        }
        if (weight < 30 || weight > 300) {
            throw new IllegalArgumentException("Weight must be between 30 and 300 kg.");
        }
        if (age < 15 || age > 100) {
            throw new IllegalArgumentException("Age must be between 15 and 100 years.");
        }
        if (daysAvailable < 1 || daysAvailable > 7) {
            throw new IllegalArgumentException("Days available must be between 1 and 7.");
        }
        if (hoursPerDay < 0.5 || hoursPerDay > 4) {
            throw new IllegalArgumentException("Hours per day must be between 0.5 and 4.");
        }
    }
    
    /**
     * Calculates BMR, maintenance calories, and target calories
     */
    private CalorieResults calculateCalories(PersonalData data) {
        // Calculate BMR using Mifflin-St Jeor equation (more accurate than Harris-Benedict)
        double bmr = calculateBMR(data.getHeight(), data.getWeight(), data.getAge(), data.getGender());
        
        // Calculate maintenance calories
        int maintenanceCalories = (int) Math.round(bmr * data.getActivityLevel());
        
        // Calculate target calories based on goal
        int targetCalories = calculateTargetCalories(maintenanceCalories, data.getGoal());
        
        // Calculate BMI
        double bmi = calculateBMI(data.getHeight(), data.getWeight());
        
        return new CalorieResults((int) Math.round(bmr), maintenanceCalories, targetCalories, bmi);
    }
    
    /**
     * Calculates BMR using Mifflin-St Jeor equation
     * More accurate than Harris-Benedict, especially for overweight individuals
     */
    private double calculateBMR(double height, double weight, int age, String gender) {
        // Base calculation: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years)
        double baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
        
        // Gender adjustment
        if ("male".equalsIgnoreCase(gender)) {
            return baseBMR + 5;
        } else {
            return baseBMR - 161;
        }
    }
    
    /**
     * Calculates BMI (Body Mass Index)
     */
    private double calculateBMI(double height, double weight) {
        double heightInMeters = height / 100.0;
        return weight / (heightInMeters * heightInMeters);
    }
    
    /**
     * Calculates target calories based on fitness goal
     */
    private int calculateTargetCalories(int maintenanceCalories, String goal) {
        if (goal == null) goal = "maintain";
        
        switch (goal.toLowerCase()) {
            case "lose":
                return maintenanceCalories - 500; // 500 cal deficit for ~1 lb/week loss
            case "gain":
                return maintenanceCalories + 500; // 500 cal surplus for ~1 lb/week gain
            default:
                return maintenanceCalories;
        }
    }
    
    /**
     * Generates appropriate workout plan based on availability
     */
    private WorkoutPlan generateWorkoutPlan(int daysAvailable, double hoursPerDay) {
        String planName;
        String description;
        
        switch (daysAvailable) {
            case 1:
                planName = "Full Body Blast";
                description = "A comprehensive full-body workout that targets all major muscle groups in one intense session. Perfect for busy schedules while ensuring balanced development.";
                break;
            case 2:
                planName = "Push-Pull Split";
                description = "An efficient 2-day split focusing on pushing movements (chest, shoulders, triceps) and pulling movements (back, biceps) with legs incorporated throughout.";
                break;
            case 3:
                planName = "Push-Pull-Legs (PPL)";
                description = "The classic 3-day split that separates pushing muscles, pulling muscles, and legs. Provides excellent balance between intensity and recovery.";
                break;
            case 4:
                planName = "Upper/Lower Split";
                description = "A 4-day program alternating between upper body and lower body sessions. Allows for higher training frequency and volume for faster results.";
                break;
            case 5:
                planName = "Arnold Split";
                description = "An advanced 5-day split popularized by Arnold Schwarzenegger. Combines muscle groups strategically for maximum growth and definition.";
                break;
            default:
                planName = "Advanced Bro Split";
                description = "A high-frequency split dedicating individual days to specific muscle groups. Ideal for advanced trainees seeking maximum muscle specialization.";
        }
        
        return new WorkoutPlan(planName, description, daysAvailable, hoursPerDay);
    }
    
    /**
     * Calculates macronutrient distribution based on target calories
     * Uses a balanced approach: 30% protein, 35% carbs, 35% fat
     */
    private MacroNutrients calculateMacronutrients(int targetCalories) {
        // Calculate calories for each macro
        int proteinCalories = (int) (targetCalories * 0.30);
        int carbCalories = (int) (targetCalories * 0.35);
        int fatCalories = (int) (targetCalories * 0.35);
        
        // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
        int proteinGrams = proteinCalories / 4;
        int carbGrams = carbCalories / 4;
        int fatGrams = fatCalories / 9;
        
        return new MacroNutrients(proteinGrams, carbGrams, fatGrams);
    }
    
    /**
     * Sets all calculated attributes for JSP rendering
     */
    private void setResultAttributes(HttpServletRequest request, PersonalData personalData,
                                   CalorieResults results, WorkoutPlan workoutPlan, MacroNutrients macros) {
        // Personal data
        request.setAttribute("height", personalData.getHeight());
        request.setAttribute("weight", personalData.getWeight());
        request.setAttribute("age", personalData.getAge());
        request.setAttribute("gender", personalData.getGender());
        request.setAttribute("goal", personalData.getGoal());
        
        // Calorie results
        request.setAttribute("bmr", results.getBmr());
        request.setAttribute("maintenanceCalories", results.getMaintenanceCalories());
        request.setAttribute("targetCalories", results.getTargetCalories());
        request.setAttribute("bmi", results.getBmi());
        
        // Workout plan
        request.setAttribute("workoutPlan", workoutPlan.getName());
        request.setAttribute("workoutDescription", workoutPlan.getDescription());
        
        // Macronutrients
        request.setAttribute("proteinGrams", macros.getProteinGrams());
        request.setAttribute("carbGrams", macros.getCarbGrams());
        request.setAttribute("fatGrams", macros.getFatGrams());
        
        // Additional helpful attributes
        request.setAttribute("calculationDate", new java.util.Date());
        request.setAttribute("bmiCategory", getBMICategory(results.getBmi()));
    }
    
    /**
     * Returns BMI category based on BMI value
     */
    private String getBMICategory(double bmi) {
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal weight";
        if (bmi < 30) return "Overweight";
        return "Obese";
    }
    
    /**
     * Handles errors by forwarding to an error page or showing a message
     */
    private void handleError(HttpServletRequest request, HttpServletResponse response, String message) 
            throws ServletException, IOException {
        request.setAttribute("errorMessage", message);
        request.setAttribute("showError", true);
        
        // You could forward to an error page instead
        RequestDispatcher dispatcher = request.getRequestDispatcher("index.html");
        dispatcher.forward(request, response);
    }
    
    // Inner classes for data organization
    
    /**
     * Data class for personal information
     */
    private static class PersonalData {
        private final double height, weight, activityLevel, hoursPerDay;
        private final int age, daysAvailable;
        private final String gender, goal;
        
        public PersonalData(double height, double weight, int age, String gender, 
                          double activityLevel, int daysAvailable, double hoursPerDay, String goal) {
            this.height = height;
            this.weight = weight;
            this.age = age;
            this.gender = gender;
            this.activityLevel = activityLevel;
            this.daysAvailable = daysAvailable;
            this.hoursPerDay = hoursPerDay;
            this.goal = goal;
        }
        
        // Getters
        public double getHeight() { return height; }
        public double getWeight() { return weight; }
        public int getAge() { return age; }
        public String getGender() { return gender; }
        public double getActivityLevel() { return activityLevel; }
        public int getDaysAvailable() { return daysAvailable; }
        public double getHoursPerDay() { return hoursPerDay; }
        public String getGoal() { return goal; }
    }
    
    /**
     * Data class for calorie calculation results
     */
    private static class CalorieResults {
        private final int bmr, maintenanceCalories, targetCalories;
        private final double bmi;
        
        public CalorieResults(int bmr, int maintenanceCalories, int targetCalories, double bmi) {
            this.bmr = bmr;
            this.maintenanceCalories = maintenanceCalories;
            this.targetCalories = targetCalories;
            this.bmi = bmi;
        }
        
        // Getters
        public int getBmr() { return bmr; }
        public int getMaintenanceCalories() { return maintenanceCalories; }
        public int getTargetCalories() { return targetCalories; }
        public double getBmi() { return bmi; }
    }
    
    /**
     * Data class for workout plan information
     */
    private static class WorkoutPlan {
        private final String name, description;
        private final int daysAvailable;
        private final double hoursPerDay;
        
        public WorkoutPlan(String name, String description, int daysAvailable, double hoursPerDay) {
            this.name = name;
            this.description = description;
            this.daysAvailable = daysAvailable;
            this.hoursPerDay = hoursPerDay;
        }
        
        // Getters
        public String getName() { return name; }
        public String getDescription() { return description; }
        public int getDaysAvailable() { return daysAvailable; }
        public double getHoursPerDay() { return hoursPerDay; }
    }
    
    /**
     * Data class for macronutrient information
     */
    private static class MacroNutrients {
        private final int proteinGrams, carbGrams, fatGrams;
        
        public MacroNutrients(int proteinGrams, int carbGrams, int fatGrams) {
            this.proteinGrams = proteinGrams;
            this.carbGrams = carbGrams;
            this.fatGrams = fatGrams;
        }
        
        // Getters
        public int getProteinGrams() { return proteinGrams; }
        public int getCarbGrams() { return carbGrams; }
        public int getFatGrams() { return fatGrams; }
    }
}
