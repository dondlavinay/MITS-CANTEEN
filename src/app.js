// This file initializes the college canteen website application and handles user interactions.

import { renderMenu } from './components/menu';

const app = () => {
    console.log("Welcome to the College Canteen!");

    // Initialize the menu
    renderMenu();
};

// Start the application
app();