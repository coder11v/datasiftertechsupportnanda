// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAC2uTDSsfKNLhTKRZEdFFComXE0h74Gpk",
  authDomain: "vibtechnanda.firebaseapp.com",
  projectId: "vibtechnanda",
  storageBucket: "vibtechnanda.firebasestorage.app",
  messagingSenderId: "914097976138",
  appId: "1:914097976138:web:1dfc6ffb9ca79769ca07b3",
  measurementId: "G-4F1GNJLZ2E"
};

let db;

// Helper function to display messages
function showMessage(elementId, message, type = 'success', duration = 3000) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.className = `form-message ${type}`; // Reset classes and apply new type
    messageElement.style.display = 'block';

    setTimeout(() => {
        messageElement.style.display = 'none';
    }, duration);
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    initFirebase();

    if (db) {
        loadTasks();
        loadMoneyLog();
    }

    const moneyForm = document.getElementById('money-form');
    if (moneyForm) {
        moneyForm.addEventListener('submit', (event) => {
            event.preventDefault();
            handleMoneyFormSubmit();
        });
    }
});

function initFirebase() {
    console.log("Initializing Firebase...");
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebase.analytics();
        console.log("Firebase initialized successfully.");
    } catch (e) {
        console.error("Error initializing Firebase: ", e);
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error initializing Firebase. Please check the console for details and ensure your Firebase project is set up correctly.</p>';
        }
    }
}

async function loadTasks() {
    console.log("Loading tasks...");
    const taskListUl = document.getElementById('task-list');
    if (!taskListUl) {
        console.error("Task list UL element not found.");
        return;
    }
    taskListUl.innerHTML = '<li>Loading tasks...</li>';

    try {
        const tasksCollection = await db.collection("tasks").orderBy("name").get();
        if (tasksCollection.empty) {
            taskListUl.innerHTML = '<li>No tasks found.</li>';
            return;
        }
        taskListUl.innerHTML = '';
        tasksCollection.forEach(doc => {
            const task = doc.data();
            const listItem = document.createElement('li');
            listItem.textContent = task.name || "Unnamed task";
            taskListUl.appendChild(listItem);
        });
        console.log("Tasks loaded successfully.");
    } catch (error) {
        console.error("Error loading tasks: ", error);
        taskListUl.innerHTML = '<li>Error loading tasks. Check console for details.</li>';
    }
}

async function handleMoneyFormSubmit() {
    console.log("Handling money form submission...");
    const amountInput = document.getElementById('money-amount');
    const descriptionInput = document.getElementById('money-description');
    const messageAreaId = 'money-form-message'; // ID of the message area

    if (!amountInput || !descriptionInput) {
        console.error("Money form input elements not found.");
        showMessage(messageAreaId, "Error: Form elements not found. Please refresh.", 'error');
        return;
    }

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();

    if (isNaN(amount)) {
        showMessage(messageAreaId, "Please enter a valid amount.", 'error');
        amountInput.focus();
        return;
    }

    if (description === "") {
        showMessage(messageAreaId, "Please enter a description.", 'error');
        descriptionInput.focus();
        return;
    }

    try {
        await db.collection("money").add({
            amount: amount,
            description: description,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("Money entry added successfully to 'money' collection.");
        showMessage(messageAreaId, "Money entry added successfully!", 'success');

        amountInput.value = '';
        descriptionInput.value = '';

        if (typeof loadMoneyLog === "function") {
            loadMoneyLog();
        }

    } catch (error) {
        console.error("Error adding money entry: ", error);
        showMessage(messageAreaId, "Error adding money entry. See console for details.", 'error');
    }
}

async function loadMoneyLog() {
    console.log("Loading money log...");
    const moneyLogUl = document.getElementById('money-log-list');
    if (!moneyLogUl) {
        console.error("Money log UL element not found.");
        return;
    }
    moneyLogUl.innerHTML = '<li>Loading money log...</li>';

    try {
        const moneyCollection = await db.collection("money").orderBy("createdAt", "desc").get();
        if (moneyCollection.empty) {
            moneyLogUl.innerHTML = '<li>No money entries found.</li>';
            return;
        }
        moneyLogUl.innerHTML = '';
        moneyCollection.forEach(doc => {
            const entry = doc.data();
            const listItem = document.createElement('li');
            let amountString = entry.amount;
            if (typeof entry.amount === 'number') {
                amountString = entry.amount.toFixed(2);
            }
            listItem.textContent = `$${amountString} - ${entry.description}`;
            if (entry.amount > 0) {
                listItem.classList.add('positive-amount');
            } else if (entry.amount < 0) {
                listItem.classList.add('negative-amount');
            }
            moneyLogUl.appendChild(listItem);
        });
        console.log("Money log loaded successfully.");
    } catch (error) {
        console.error("Error loading money log: ", error);
        moneyLogUl.innerHTML = '<li>Error loading money log. Check console for details.</li>';
    }
}
