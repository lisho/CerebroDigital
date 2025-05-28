# LEEME

Una herramienta digital integral asistida por IA para apoyar a los trabajadores sociales en sus tareas diarias, proporcionando información rápida, sugerencias de recursos y asistencia con notas de casos. Impulsado por Gemini API.

## Tabla de Contenidos

*   [Características Clave](#características-clave)
*   [Tecnologías Utilizadas](#tecnologías-utilizadas)
*   [Descripción General de la Estructura del Proyecto](#descripción-general-de-la-estructura-del-proyecto)
*   [Cómo Empezar](#cómo-empezar)
*   [Scripts Disponibles](#scripts-disponibles)
*   [Panel de Administración](#panel-de-administración)
*   [Licencia](#licencia)

## Características Clave

*   **Panel de Control:** Vista general de tareas, citas y notificaciones importantes.
*   **Gestión de Casos:** Ver lista de casos, ver detalles de casos y gestionar la información de los casos.
*   **Gestión de Tareas:** Crear, asignar y seguir tareas.
*   **Programación:** Gestionar citas y horarios.
*   **Asistente IA/Chat:** Impulsado por Gemini API para información rápida y sugerencias.
*   **Notas de Clientes:** Gestionar y acceder de forma segura a las notas de los clientes.
*   **Gestión de Recursos:** Acceder y gestionar un directorio de recursos.
*   **Gestión de Perfiles de Usuario:** Gestionar perfiles y configuraciones de usuario.
*   **Panel de Administración:**
    *   Panel de control para una visión general administrativa.
    *   Gestión de Usuarios para agregar, editar y eliminar usuarios.
    *   Configuración de la Aplicación para configurar la aplicación.

## Tecnologías Utilizadas

*   React
*   TypeScript
*   Vite
*   React Router
*   Google Gemini API

## Descripción General de la Estructura del Proyecto

*   `src/components`: Componentes de interfaz de usuario reutilizables.
*   `src/views`: Vistas/páginas de la aplicación.
*   `src/services`: Servicios como integraciones API (por ejemplo, Gemini).
*   `src/contexts`: Contexto de React para la gestión del estado.
*   `public/data`: Datos JSON de muestra para desarrollo.
*   `src/App.tsx`: Componente principal de la aplicación con enrutamiento.
*   `src/index.tsx`: Punto de entrada de la aplicación.

## Cómo Empezar

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/your-username/digital-brain-social-workers.git
    ```
    *Reemplaza `https://github.com/your-username/digital-brain-social-workers.git` con la URL real del repositorio.*
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecuta el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

## Scripts Disponibles

*   `npm run dev`: Inicia el servidor de desarrollo (generalmente en `http://localhost:5173`).
*   `npm run build`: Empaqueta la aplicación para producción.
*   `npm run preview`: Sirve la compilación de producción localmente para vista previa.

## Panel de Administración

*   Accesible a través de la ruta `/admin`.
*   Proporciona funcionalidades administrativas como la gestión de usuarios y la configuración de la aplicación.

## Licencia

Este proyecto es privado.

---
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
    *Replace `https://github.com/your-username/digital-brain-social-workers.git` with the actual repository URL.*
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
