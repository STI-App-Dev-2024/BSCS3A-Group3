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

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid response format");
    }

    displayQuestions(data.questions);
    console.log("converted", data.questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    alert("Error fetching questions. Please try again.");
  }
});

export function displayQuestions(questions) {
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
            <input type="radio" name="question${index}" value="${String.fromCharCode(
              65 + optionIndex
            )}" />
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

  submitButton.addEventListener("click", () => calculateScores(questions));
  submitButton2.addEventListener("click", () => calculateScores2(questions));
  saveButton.addEventListener("click", () => promptAndSaveQuiz(questions));
}

async function promptAndSaveQuiz(questions) {
  const quizName = prompt("Enter quiz name to save quiz:");
  if (quizName) {
    try {
      await saveQuiz(quizName, questions);
      alert("Quiz saved successfully in the folder!");
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save the quiz. Please try again.");
    }
  } else {
    alert("No quiz name entered. Quiz not saved.");
  }
}

async function saveQuiz(quizName, questions) {
  const userId = localStorage.getItem("loggedInUserId");
  if (!userId) {
    alert("User not logged in!");
    return;
  }

  const quizData = {
    quizName: quizName,
    timestamp: new Date(),
    score: 0,
    questions: questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.answer,
    })),
  };

  try {
    const quizzesCollection = collection(db, "users", userId, "quizzes");
    await addDoc(quizzesCollection, quizData);
  } catch (error) {
    console.error("Error writing quiz to Firestore:", error);
    throw error;
  }
}

async function calculateScores(questions) {
  let score = 0;
  const scores = {};

  // Calculate the score by comparing answers
  questions.forEach((question, index) => {
    const selectedOption = document.querySelector(
      `input[name="question${index}"]:checked`
    );
    if (selectedOption) {
      scores[index] = selectedOption.value;
      if (selectedOption.value === question.answer) score++;
    }
  });

  // Display the score
  alert(`Your score: ${score}`);

  // Save the score to Firestore
  try {
    const userId = localStorage.getItem("loggedInUserId");
    if (!userId) {
      alert("User not logged in!");
      return;
    }

    const quizName = prompt("Enter quiz name to save your score:");
    if (!quizName) {
      alert("No quiz name entered. Score not saved.");
      return;
    }

    // Retrieve or create the quiz document in Firestore
    const quizzesCollection = collection(db, "users", userId, "quizzes");
    const quizQuery = query(
      quizzesCollection,
      where("quizName", "==", quizName)
    );
    const existingQuizSnapshot = await getDocs(quizQuery);

    if (!existingQuizSnapshot.empty) {
      // If the quiz already exists, update the score
      const quizDocRef = existingQuizSnapshot.docs[0].ref;
      await updateDoc(quizDocRef, { score });
      alert("Score updated successfully!");
    } else {
      // If the quiz doesn't exist, create a new quiz with the score
      const quizData = {
        quizName: quizName,
        timestamp: new Date(),
        score: score,
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.answer,
        })),
      };
      await addDoc(quizzesCollection, quizData);
      alert("Quiz and score saved successfully!");
    }
  } catch (error) {
    console.error("Error saving score:", error);
    alert("Error saving score. Please try again.");
  }
}

async function calculateScores2(questions) {
  console.log("nice!");
}
