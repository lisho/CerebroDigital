
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { PendingAppointmentProvider } from './contexts/PendingAppointmentContext';
import { PendingTaskProvider } from './contexts/PendingTaskContext'; // Import the new provider

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <PendingAppointmentProvider>
        <PendingTaskProvider> {/* Wrap App with PendingTaskProvider */}
          <App />
        </PendingTaskProvider>
      </PendingAppointmentProvider>
    </ThemeProvider>
  </React.StrictMode>
);
