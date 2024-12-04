import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  addDoc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.querySelector(".convert-btn").addEventListener("click", async () => {
  const questionCount = document.getElementById("questionCount").value;
  const fileInput = document.getElementById("fileInput");

  if (fileInput.files.length === 0) {
    alert("Please upload a file before converting.");
    return;
  }

  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("files[]", file);
  formData.append("questionCount", questionCount);

  try {
    const response = await fetch("http://127.0.0.1:5000/convert", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid response format");
    }

    displayQuestions(data.questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    alert("Error fetching questions. Please try again.");
  }
});
function displayQuestions(questions) {
  const content = document.querySelector(".content");
  content.innerHTML = `
    <h2 class="quiz-title">Quiz Questions</h2>
    <div class="questions-container"></div>
  `;

  const questionsContainer = content.querySelector(".questions-container");
  questions.forEach((question, index) => {
    const questionElement = document.createElement("div");
    questionElement.className = "question-card";
    questionElement.innerHTML = `
      <p class="question-text">${index + 1}. ${question.question}</p>
      <div class="options-container">
        ${question.options
          .map(
            (option, optionIndex) => `
          <label class="option-label">
            <input type="radio" name="question${index}" value="${String.fromCharCode(65 + optionIndex)}" />
            ${option}
          </label>
        `
          )
          .join("")}
      </div>
    `;
    questionsContainer.appendChild(questionElement);
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const submitButton = document.createElement("button");
  submitButton.id = "submitBtn";
  submitButton.className = "primary-button";
  submitButton.textContent = "Submit";
  buttonContainer.appendChild(submitButton);

  const saveButton = document.createElement("button");
  saveButton.id = "saveBtn";
  saveButton.className = "secondary-button";
  saveButton.textContent = "Save";
  buttonContainer.appendChild(saveButton);

  content.appendChild(buttonContainer);

  submitButton.addEventListener("click", () => {
    calculateScores(questions);
  });

  saveButton.addEventListener("click", async () => {
    const quizName = prompt("Enter quiz name to save quiz:");

    if (quizName) {
      await saveQuiz(quizName, questions);
    } else {
      alert("No quiz name entered. Quiz not saved.");
    }
  });
}

async function saveQuiz(quizName, questions) {
  const userId = localStorage.getItem("loggedInUserId");

  const quizData = {
    quizName: quizName,
    timestamp: new Date(),
    score: 0,
    questions: questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.answer,
    })),
  };

  const quizRef = doc(db, "users", userId, "quizzes", `quiz-${Date.now()}`);

  await setDoc(quizRef, quizData);
  alert("Quiz saved successfully in the folder!");

  window.location.href = "sd_quizzes.html";
}

// Function to calculate scores
async function calculateScores(questions) {
  const scores = {};
  let score = 0;

  questions.forEach((question, index) => {
    const selectedOption = document.querySelector(
      `input[name="question${index}"]:checked`
    );
    if (selectedOption) {
      scores[index] = selectedOption.value;
      if (selectedOption.value === question.answer) {
        score++;
      }
    }
  });

  try {
    const response = await fetch("http://127.0.0.1:5000/submit-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scores, questions }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();
    alert(`Your score: ${result.score}`);

    // Save quiz results to Firestore
    const userId = localStorage.getItem("loggedInUserId");
    if (!userId) {
      alert("User not logged in!");
      return;
    }

    await saveQuizToFolder(questions);
  } catch (error) {
    console.error("Error submitting quiz:", error);
    alert("Error submitting quiz. Please try again.");
  }
}