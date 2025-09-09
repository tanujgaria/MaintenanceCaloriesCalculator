import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class WebServer {
    private static final int PORT = 5000;
    
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        
        // Static file handler
        server.createContext("/", new StaticFileHandler());
        
        // Calculator endpoint
        server.createContext("/calculate", new CalculatorHandler());
        
        server.setExecutor(null);
        server.start();
        
        System.out.println("Server started on port " + PORT);
        System.out.println("Access the application at: http://localhost:" + PORT);
    }
    
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            
            if (path.equals("/")) {
                path = "/index.html";
            }
            
            // Remove leading slash
            if (path.startsWith("/")) {
                path = path.substring(1);
            }
            
            File file = new File(path);
            
            if (file.exists() && file.isFile()) {
                String contentType = getContentType(path);
                exchange.getResponseHeaders().set("Content-Type", contentType);
                
                byte[] content = Files.readAllBytes(file.toPath());
                exchange.sendResponseHeaders(200, content.length);
                
                OutputStream outputStream = exchange.getResponseBody();
                outputStream.write(content);
                outputStream.close();
            } else {
                String response = "404 - File not found";
                exchange.sendResponseHeaders(404, response.length());
                OutputStream outputStream = exchange.getResponseBody();
                outputStream.write(response.getBytes());
                outputStream.close();
            }
        }
        
        private String getContentType(String path) {
            if (path.endsWith(".html") || path.endsWith(".htm")) return "text/html";
            if (path.endsWith(".css")) return "text/css";
            if (path.endsWith(".js")) return "application/javascript";
            if (path.endsWith(".json")) return "application/json";
            if (path.endsWith(".png")) return "image/png";
            if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
            if (path.endsWith(".gif")) return "image/gif";
            if (path.endsWith(".svg")) return "image/svg+xml";
            return "text/plain";
        }
    }
    
    static class CalculatorHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            
            try {
                // Parse form data
                InputStreamReader reader = new InputStreamReader(exchange.getRequestBody());
                BufferedReader bufferedReader = new BufferedReader(reader);
                String formData = bufferedReader.readLine();
                
                Map<String, String> params = parseFormData(formData);
                
                // Extract and validate parameters
                double height = Double.parseDouble(params.get("height"));
                double weight = Double.parseDouble(params.get("weight"));
                int age = Integer.parseInt(params.get("age"));
                String gender = params.get("gender");
                double activityLevel = Double.parseDouble(params.get("activityLevel"));
                int days = Integer.parseInt(params.get("days"));
                double hours = Double.parseDouble(params.get("hours"));
                String goal = params.getOrDefault("goal", "maintain");
                
                // Validate ranges
                if (height < 100 || height > 250) throw new IllegalArgumentException("Invalid height");
                if (weight < 30 || weight > 300) throw new IllegalArgumentException("Invalid weight");
                if (age < 15 || age > 100) throw new IllegalArgumentException("Invalid age");
                if (days < 1 || days > 7) throw new IllegalArgumentException("Invalid days");
                if (hours < 0.5 || hours > 4) throw new IllegalArgumentException("Invalid hours");
                
                // Perform calculations
                double bmr = calculateBMR(height, weight, age, gender);
                int maintenanceCalories = (int) Math.round(bmr * activityLevel);
                int targetCalories = calculateTargetCalories(maintenanceCalories, goal);
                double bmi = calculateBMI(height, weight);
                
                // Generate workout plan
                WorkoutPlan workoutPlan = generateWorkoutPlan(days, hours);
                
                // Calculate macros
                MacroNutrients macros = calculateMacronutrients(targetCalories);
                
                // Generate JSP-like response
                String response = generateResultsPage(
                    (int) Math.round(bmr), maintenanceCalories, targetCalories, goal, bmi,
                    workoutPlan, macros, gender, height, weight, age
                );
                
                exchange.getResponseHeaders().set("Content-Type", "text/html");
                exchange.sendResponseHeaders(200, response.length());
                
                OutputStream outputStream = exchange.getResponseBody();
                outputStream.write(response.getBytes());
                outputStream.close();
                
            } catch (Exception e) {
                String errorResponse = generateErrorPage(e.getMessage());
                exchange.getResponseHeaders().set("Content-Type", "text/html");
                exchange.sendResponseHeaders(400, errorResponse.length());
                
                OutputStream outputStream = exchange.getResponseBody();
                outputStream.write(errorResponse.getBytes());
                outputStream.close();
            }
        }
        
        private Map<String, String> parseFormData(String formData) throws UnsupportedEncodingException {
            Map<String, String> params = new HashMap<>();
            if (formData != null) {
                String[] pairs = formData.split("&");
                for (String pair : pairs) {
                    String[] keyValue = pair.split("=");
                    if (keyValue.length == 2) {
                        String key = URLDecoder.decode(keyValue[0], "UTF-8");
                        String value = URLDecoder.decode(keyValue[1], "UTF-8");
                        params.put(key, value);
                    }
                }
            }
            return params;
        }
        
        private double calculateBMR(double height, double weight, int age, String gender) {
            double baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
            return "male".equalsIgnoreCase(gender) ? baseBMR + 5 : baseBMR - 161;
        }
        
        private double calculateBMI(double height, double weight) {
            double heightInMeters = height / 100.0;
            return weight / (heightInMeters * heightInMeters);
        }
        
        private int calculateTargetCalories(int maintenanceCalories, String goal) {
            switch (goal.toLowerCase()) {
                case "lose": return maintenanceCalories - 500;
                case "gain": return maintenanceCalories + 500;
                default: return maintenanceCalories;
            }
        }
        
        private WorkoutPlan generateWorkoutPlan(int days, double hours) {
            switch (days) {
                case 1:
                    return new WorkoutPlan("Full Body Blast", 
                        "A comprehensive full-body workout that targets all major muscle groups in one intense session. Perfect for busy schedules while ensuring balanced development.");
                case 2:
                    return new WorkoutPlan("Push-Pull Split",
                        "An efficient 2-day split focusing on pushing movements (chest, shoulders, triceps) and pulling movements (back, biceps) with legs incorporated throughout.");
                case 3:
                    return new WorkoutPlan("Push-Pull-Legs (PPL)",
                        "The classic 3-day split that separates pushing muscles, pulling muscles, and legs. Provides excellent balance between intensity and recovery.");
                case 4:
                    return new WorkoutPlan("Upper/Lower Split",
                        "A 4-day program alternating between upper body and lower body sessions. Allows for higher training frequency and volume for faster results.");
                case 5:
                    return new WorkoutPlan("Arnold Split",
                        "An advanced 5-day split popularized by Arnold Schwarzenegger. Combines muscle groups strategically for maximum growth and definition.");
                default:
                    return new WorkoutPlan("Advanced Bro Split",
                        "A high-frequency split dedicating individual days to specific muscle groups. Ideal for advanced trainees seeking maximum muscle specialization.");
            }
        }
        
        private MacroNutrients calculateMacronutrients(int targetCalories) {
            int proteinGrams = (int) (targetCalories * 0.30 / 4);
            int carbGrams = (int) (targetCalories * 0.35 / 4);
            int fatGrams = (int) (targetCalories * 0.35 / 9);
            return new MacroNutrients(proteinGrams, carbGrams, fatGrams);
        }
        
        private String getBMICategory(double bmi) {
            if (bmi < 18.5) return "Underweight";
            if (bmi < 25) return "Normal weight";
            if (bmi < 30) return "Overweight";
            return "Obese";
        }
        
        private String generateResultsPage(int bmr, int maintenanceCalories, int targetCalories, 
                                         String goal, double bmi, WorkoutPlan workoutPlan, 
                                         MacroNutrients macros, String gender, double height, 
                                         double weight, int age) {
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
            
            String bmiCategory = getBMICategory(bmi);
            
            return String.format(getResultsTemplate(),
                goalColor, goalIcon, goalText, bmr, maintenanceCalories, targetCalories,
                maintenanceCalories - 500, maintenanceCalories, maintenanceCalories + 500,
                String.format("%.1f", bmi), bmiCategory, workoutPlan.name, workoutPlan.description,
                macros.proteinGrams, macros.carbGrams, macros.fatGrams, bmr, maintenanceCalories - bmr
            );
        }
        
        private String generateErrorPage(String errorMessage) {
            return "<!DOCTYPE html><html><head><title>Error</title><link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css\" rel=\"stylesheet\"></head>" +
                   "<body><div class=\"container mt-5\"><div class=\"alert alert-danger\"><h3>Error</h3><p>" + errorMessage + "</p>" +
                   "<a href=\"/\" class=\"btn btn-primary\">Go Back</a></div></div></body></html>";
        }
        
        private String getResultsTemplate() {
            try {
                return new String(Files.readAllBytes(Paths.get("result_template.html")));
            } catch (IOException e) {
                // Fallback inline template
                return "<!DOCTYPE html><html><head><title>Results</title><link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css\" rel=\"stylesheet\"><link rel=\"stylesheet\" href=\"style.css\"></head>" +
                       "<body><nav class=\"navbar navbar-expand-lg navbar-dark bg-gradient-primary fixed-top\"><div class=\"container\"><a class=\"navbar-brand\" href=\"/\">Maintenance Calories Calculator</a></div></nav>" +
                       "<section class=\"hero-section\"><div class=\"container hero-content\"><h1 class=\"display-4 text-white text-center\">Your Personalized Results</h1></div></section>" +
                       "<section class=\"py-5\"><div class=\"container\"><div class=\"row\"><div class=\"col-lg-6\"><div class=\"card\"><div class=\"card-header bg-%s text-white\"><h5>Calorie Breakdown</h5></div>" +
                       "<div class=\"card-body\"><div class=\"alert alert-%s\"><i class=\"fas fa-%s\"></i> %s</div>" +
                       "<p><strong>BMR:</strong> %d calories</p><p><strong>Maintenance:</strong> %d calories</p><p><strong>Target:</strong> %d calories</p>" +
                       "<p><strong>BMI:</strong> %s (%s)</p></div></div></div>" +
                       "<div class=\"col-lg-6\"><div class=\"card\"><div class=\"card-header bg-success text-white\"><h5>Workout Plan</h5></div>" +
                       "<div class=\"card-body\"><h4>%s</h4><p>%s</p></div></div></div></div>" +
                       "<div class=\"row mt-4\"><div class=\"col-12\"><div class=\"card\"><div class=\"card-header bg-info text-white\"><h5>Macronutrients</h5></div>" +
                       "<div class=\"card-body\"><div class=\"row\"><div class=\"col-md-4 text-center\"><h6>Protein</h6><p>%dg</p></div>" +
                       "<div class=\"col-md-4 text-center\"><h6>Carbs</h6><p>%dg</p></div><div class=\"col-md-4 text-center\"><h6>Fat</h6><p>%dg</p></div></div></div></div></div></div>" +
                       "<div class=\"text-center mt-4\"><a href=\"/\" class=\"btn btn-primary btn-lg\">Calculate Again</a></div></div></section></body></html>";
            }
        }
    }
    
    static class WorkoutPlan {
        String name;
        String description;
        
        WorkoutPlan(String name, String description) {
            this.name = name;
            this.description = description;
        }
    }
    
    static class MacroNutrients {
        int proteinGrams;
        int carbGrams;
        int fatGrams;
        
        MacroNutrients(int proteinGrams, int carbGrams, int fatGrams) {
            this.proteinGrams = proteinGrams;
            this.carbGrams = carbGrams;
            this.fatGrams = fatGrams;
        }
    }
}