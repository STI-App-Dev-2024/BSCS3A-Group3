import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

// Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyDoLbJdlLUsfMp09PwA_31TYcetC3JxIWs",
    authDomain: "instaquiz-37134.firebaseapp.com",
    projectId: "instaquiz-37134",
    storageBucket: "instaquiz-37134.appspot.com",
    messagingSenderId: "78078580689",
    appId: "1:78078580689:web:0184ebf9d3896a3b20b2f0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Fetch and display shared quizzes for the logged-in user
const fetchSharedQuizzes = async (userId) => {
    try {
        // Reference the shared sub-collection
        const sharedRef = collection(db, `users/${userId}/shared`);
        const querySnapshot = await getDocs(sharedRef);

        const container = document.getElementById("shared-quizzes-container");
        container.innerHTML = ""; // Clear any previous content

        if (querySnapshot.empty) {
            container.innerHTML = "<p>No shared quizzes available.</p>";
        } else {
            querySnapshot.forEach((doc) => {
                const quiz = doc.data();

                // Create HTML for each shared quiz
                const quizElement = document.createElement("div");
                quizElement.classList.add("quiz-item");
                quizElement.innerHTML = `
                    <h2>${quiz.quizName}</h2>
                    <p>From: ${quiz.sharedDetails[0]?.senderFirstName || 'Unknown'} ${quiz.sharedDetails[0]?.senderLastName || ''}</p>
                    <p>Message: ${quiz.sharedDetails[0]?.message || 'No message provided'}</p>
                    <p>Score: ${quiz.score || 'N/A'}</p>
                    <button onclick="viewQuiz('${doc.id}')">View Quiz</button>
                `;
                container.appendChild(quizElement);
            });
        }
    } catch (error) {
        console.error("Error fetching shared quizzes:", error);
    }
};

// Handle user authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchSharedQuizzes(user.uid); // Fetch quizzes shared with the logged-in user
    } else {
        console.log("User is not authenticated.");
    }
});

// Function to view a quiz
window.viewQuiz = (quizId) => {
    // Redirect or display the quiz details
    window.location.href = `../quizzes/quiz.html?id=${quizId}`;
};
