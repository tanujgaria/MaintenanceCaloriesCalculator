# Maintenance Calories Calculator - Setup Guide

## Quick Start for VS Code

### Step 1: Create package.json
In your project folder (`C:\Users\divya\Downloads\MaintenanceCalorieTracker`), create a file named `package.json` with this content:

```json
{
  "name": "maintenance-calories-calculator",
  "version": "1.0.0",
  "description": "Enhanced maintenance calories calculator web application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### Step 2: Install Dependencies
Open terminal in VS Code and run:
```bash
npm install
```

### Step 3: Start the Server
Run:
```bash
npm start
```

### Step 4: Access the Application
Open your browser and go to: `http://localhost:5000`

## Project Files Required

Make sure you have these files in your project folder:

1. **index.html** - Main calculator page
2. **style.css** - Styling and animations
3. **script.js** - Frontend JavaScript
4. **server.js** - Backend Node.js server
5. **package.json** - Node.js configuration (create as shown above)

## Troubleshooting

### Error: "Cannot find module 'express'"
- Run `npm install` in the project directory

### Error: "Port 5000 already in use"
- Change the PORT variable in server.js to another number (like 3000 or 8080)

### Error: "ENOENT: no such file"
- Make sure all files are in the same directory
- Check that file names match exactly (case sensitive)

## Features

- Modern Bootstrap 5 design with animations
- Complete calorie and BMR calculations
- Workout plan recommendations
- Macronutrient breakdown
- Diet information and nutrition guides
- Responsive design for all devices