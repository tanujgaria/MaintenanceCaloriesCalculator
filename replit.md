# Maintenance Calories Calculator

## Overview

This is a Java-based web application that calculates maintenance calories, BMR (Basal Metabolic Rate), and provides personalized workout recommendations. The application uses a modern web interface with Bootstrap styling and integrates fitness calculations with workout planning functionality.

## System Architecture

The application follows a traditional Java servlet-based web architecture:

**Frontend:** HTML5, CSS3, JavaScript with Bootstrap 5.3.0 framework
**Backend:** Java servlets running on embedded Tomcat server
**Template Engine:** JSP (JavaServer Pages) for dynamic content rendering
**Build System:** Maven for dependency management
**Deployment:** Embedded Tomcat server with Jetty as alternative

The architecture is designed as a monolithic web application with clear separation between presentation (JSP/HTML), business logic (Java servlets), and styling (CSS/Bootstrap).

## Key Components

### 1. CalculatorServlet.java
- Main servlet handling POST requests to `/calculate` endpoint
- Implements Mifflin-St Jeor equation for BMR calculation
- Processes form data including height, weight, age, activity level, and workout preferences
- Calculates maintenance calories, target calories, and macronutrient breakdown
- Generates personalized workout plans based on available days and hours

### 2. Frontend Components
- **index.html**: Main calculator interface with responsive Bootstrap design
- **result.jsp**: Dynamic results page displaying calculations and recommendations
- **style.css**: Custom styling with CSS variables and modern design patterns
- **script.js**: Client-side form validation, animations, and interactive features

### 3. Configuration Files
- **.replit**: Replit environment configuration for Java module
- **pom.xml**: Maven dependencies including Tomcat embed components and servlet API

## Data Flow

1. User fills out the calculator form on index.html
2. Form data is submitted via POST to `/calculate` endpoint
3. CalculatorServlet processes the input data:
   - Extracts personal data (height, weight, age, activity level)
   - Calculates BMR using Mifflin-St Jeor equation
   - Determines maintenance and target calories
   - Generates workout plan based on availability
   - Calculates macronutrient distribution
4. Results are set as request attributes and forwarded to result.jsp
5. JSP renders the dynamic results page with personalized recommendations

## External Dependencies

### Maven Dependencies
- **Tomcat Embed Core** (11.0.8): Embedded web server
- **Tomcat Embed Jasper** (11.0.8): JSP compilation and rendering
- **Tomcat Embed WebSocket** (11.0.8): WebSocket support
- **Servlet API** (4.0.1): Java servlet specification

### Frontend Libraries (CDN)
- **Bootstrap 5.3.0**: UI framework and responsive design
- **Font Awesome 6.4.0**: Icon library
- **Chart.js**: Data visualization for results
- **Google Fonts (Poppins)**: Typography

## Deployment Strategy

The application uses embedded Tomcat server for deployment:

**Development**: Replit environment with automatic compilation and server startup
**Build Process**: 
1. Compile Java sources with classpath including lib dependencies
2. Start Tomcat server on port 5000
3. Deploy servlets and static resources

**Production Considerations**: 
- Application is configured for headless operation (`-Djava.awt.headless=true`)
- Uses embedded server approach for simplified deployment
- Static resources served directly from project root

## Changelog

- June 18, 2025: Initial setup
- June 18, 2025: Created complete static website version using only HTML, CSS, JavaScript, and JSP files as requested by user. Removed server dependencies for pure client-side functionality.

## User Preferences

Preferred communication style: Simple, everyday language.