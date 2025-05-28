# Digital Brain for Social Workers

An AI-assisted comprehensive digital tool to support social workers in their daily tasks, providing quick information, resource suggestions, and case note assistance. Powered by Gemini API.

## Table of Contents

*   [Key Features](#key-features)
*   [Technology Stack](#technology-stack)
*   [Project Structure Overview](#project-structure-overview)
*   [Getting Started](#getting-started)
*   [Available Scripts](#available-scripts)
*   [Admin Panel](#admin-panel)
*   [License](#license)

## Key Features

*   **Dashboard:** Overview of tasks, appointments, and important notifications.
*   **Case Management:** View list of cases, view case details, and manage case information.
*   **Task Management:** Create, assign, and track tasks.
*   **Scheduling:** Manage appointments and schedules.
*   **AI Assistant/Chat:** Powered by Gemini API for quick information and suggestions.
*   **Client Notes:** Securely manage and access client notes.
*   **Resource Management:** Access and manage a directory of resources.
*   **User Profile Management:** Manage user profiles and settings.
*   **Admin Panel:**
    *   Dashboard for administrative overview.
    *   User Management for adding, editing, and deleting users.
    *   App Settings for configuring the application.

## Technology Stack

*   React
*   TypeScript
*   Vite
*   React Router
*   Google Gemini API

## Project Structure Overview

*   `src/components`: Reusable UI components.
*   `src/views`: Application views/pages.
*   `src/services`: Services like API integrations (e.g., Gemini).
*   `src/contexts`: React context for state management.
*   `public/data`: Sample JSON data for development.
*   `src/App.tsx`: Main application component with routing.
*   `src/index.tsx`: Entry point of the application.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/digital-brain-social-workers.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Available Scripts

*   `npm run dev`: Starts the development server (usually at `http://localhost:5173`).
*   `npm run build`: Bundles the application for production.
*   `npm run preview`: Serves the production build locally for preview.

## Admin Panel

*   Accessible via the `/admin` route.
*   Provides administrative functionalities like user management and application settings.

## License

This project is private.
