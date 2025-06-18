# Firestore Task & Money Tracker

A simple web application to view a task list and manage personal money entries, powered by Firebase Firestore. This application is designed to be easily deployable on GitHub Pages.

## Features

*   Displays a list of tasks from a Firestore collection (read-only).
*   Allows users to add money entries (amount and description) to a separate Firestore collection.
*   Displays a log of money entries, ordered by time.
*   Read-only access to the task list and write access only for new money entries are enforced via Firestore Security Rules.
*   GitHub Pages friendly.

## Project Structure

*   `index.html`: The main HTML file for the application.
*   `style.css`: Contains all the styles for the application.
*   `script.js`: Handles Firebase integration, data fetching, and dynamic updates to the page.
*   `README.md`: This file.

## Setup

1.  **Firebase Project:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Add a Web App to your Firebase project.
    *   Copy the Firebase configuration object provided during the setup.

2.  **Update Firebase Configuration:**
    *   Open `script.js`.
    *   Replace the placeholder `firebaseConfig` object with the configuration object you copied from your Firebase project.

3.  **Firestore Database:**
    *   In your Firebase project console, go to "Firestore Database" (under Build) and create a database. Start in **production mode** (which means default rules are secure) or **test mode** and then update rules.
    *   **Task List (Manual Setup for now):**
        *   Create a collection named `tasks`.
        *   Add documents to this collection. Each document should have at least a `name` field (e.g., `{ "name": "My First Task" }`).
    *   **Money Collection (Created by App):**
        *   The `money` collection will be automatically created when you add your first money entry through the app.

4.  **Firestore Security Rules:**
    *   In the Firebase console, go to Firestore Database > Rules.
    *   Replace the existing rules with the following to ensure read-only access for tasks and create-only for money entries:
        ```text
        rules_version = '2';

        service cloud.firestore {
          match /databases/{database}/documents {

            match /tasks/{taskId} {
              allow read: if true;
              allow write: if false;
            }

            match /money/{moneyId} {
              allow read: if true;
              allow create: if request.resource.data.createdAt == request.time &&
                               request.resource.data.keys().hasAll(['amount', 'description', 'createdAt']) &&
                               request.resource.data.amount is number &&
                               request.resource.data.description is string &&
                               request.resource.data.description.size() < 500;
              allow update: if false;
              allow delete: if false;
            }

            // Optional: Default deny for any other collections if you want to be explicit
            // match /{document=**} {
            //  allow read, write: if false;
            // }
          }
        }
        ```
    *   Publish the rules.

## Deployment to GitHub Pages

1.  **Create a GitHub Repository:**
    *   If you haven't already, create a new repository on GitHub and push your project files to it.

2.  **Enable GitHub Pages:**
    *   In your GitHub repository, go to "Settings".
    *   Scroll down to the "GitHub Pages" section (or select "Pages" from the left sidebar).
    *   Under "Source", select the branch you want to deploy from (e.g., `main` or `master`).
    *   Choose the `/ (root)` folder unless your `index.html` is in a subfolder like `/docs`.
    *   Click "Save".

3.  **Access Your Site:**
    *   GitHub Pages will build and deploy your site. It might take a few minutes.
    *   Once deployed, the URL for your live site will be displayed in the GitHub Pages settings section (usually `https://<your-username>.github.io/<your-repository-name>/`).

## Development

Simply open the `index.html` file in your web browser to run the application locally. Ensure your Firebase setup is correct for data interaction.
