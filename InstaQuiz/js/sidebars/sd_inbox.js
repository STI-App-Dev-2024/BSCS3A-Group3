import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDoLbJdlLUsfMp09PwA_31TYcetC3JxIWs",
  authDomain: "instaquiz-37134.firebaseapp.com",
  projectId: "instaquiz-37134",
  storageBucket: "instaquiz-37134.appspot.com",
  messagingSenderId: "78078580689",
  appId: "1:78078580689:web:0184ebf9d3896a3b20b2f0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const fetchSharedQuizzes = async (userId) => {
  try {
    const sharedRef = collection(db, `users/${userId}/shared`);
    const querySnapshot = await getDocs(sharedRef);

    const container = document.getElementById("shared-quizzes-container");
    container.innerHTML = "";

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No shared quizzes available.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const quiz = doc.data();

        const quizElement = document.createElement("div");
        quizElement.classList.add("quiz-item");
        quizElement.innerHTML = `
                <h2>${quiz.quizName}</h2>
                <p><strong>From:</strong> ${
                  quiz.sharedDetails[0]?.senderFirstName || "Unknown"
                } ${quiz.sharedDetails[0]?.senderLastName || ""}</p>
                <p><strong>Message:</strong> ${
                  quiz.sharedDetails[0]?.message || "No message provided"
                }</p>

                `;
        container.appendChild(quizElement);
      });
    }
  } catch (error) {
    console.error("Error fetching shared quizzes:", error);
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchSharedQuizzes(user.uid);
  } else {
    console.log("User is not authenticated.");
  }
});

window.viewQuiz = (quizId) => {
  window.location.href = `../quizzes/quiz.html?id=${quizId}`;
};
