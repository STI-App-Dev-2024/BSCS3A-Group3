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
            )}" data-option="${option}" />
            ${option}
          </label>
        `
          )
          .join("")}
      </div>
      <div class="feedback-container" style="display:none;">
        <p class="feedback-text"></p>
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
  saveButton.addEventListener("click", () => promptAndSaveQuiz(questions));
}

async function calculateScores(questions) {
  let score = 0;
  const scores = {};
  const userId = localStorage.getItem("loggedInUserId");

  if (!userId) {
    alert("User not logged in!");
    return;
  }

  let quizName = localStorage.getItem("currentQuizTitle");
  if (!quizName) {
    quizName = prompt("Enter quiz name:");
    if (!quizName) {
      alert("No quiz name entered. Quiz not saved.");
      return;
    }
    localStorage.setItem("currentQuizTitle", quizName);
  }

  const radioButtons = document.querySelectorAll('input[type="radio"]');
  radioButtons.forEach((radio) => (radio.disabled = true));

  questions.forEach((question, index) => {
    const selectedOption = document.querySelector(
      `input[name="question${index}"]:checked`
    );

    const feedbackContainer = document.querySelector(
      `.questions-container .question-card:nth-child(${
        index + 1
      }) .feedback-container`
    );

    feedbackContainer.style.display = "block";
    const feedbackText = feedbackContainer.querySelector(".feedback-text");

    if (selectedOption) {
      scores[index] = {
        selectedAnswer: selectedOption.value,
        isCorrect: selectedOption.value === question.answer,
      };

      if (selectedOption.value === question.answer) {
        score++;
        feedbackText.innerHTML = ` 
          <span style="color: green;">Correct! ✓</span> 
          The answer is: ${selectedOption.getAttribute("data-option")}
        `;
        feedbackContainer.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
      } else {
        const correctOption = document.querySelector(
          `input[name="question${index}"][value="${question.answer}"]`
        );

        feedbackText.innerHTML = ` 
          <span style="color: red;">Incorrect ✗</span> 
          Your answer: ${selectedOption.getAttribute("data-option")}
          <br>Correct answer: ${correctOption.getAttribute("data-option")}
        `;
        feedbackContainer.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
      }
    } else {
      feedbackText.innerHTML = ` 
        <span style="color: orange;">No answer selected</span>
        Correct answer: ${document
          .querySelector(
            `input[name="question${index}"][value="${question.answer}"]`
          )
          .getAttribute("data-option")}
      `;
      feedbackContainer.style.backgroundColor = "rgba(255,165,0,0.1)";

      scores[index] = {
        selectedAnswer: null,
        isCorrect: false,
      };
    }
  });

  alert(`Your score: ${score} out of ${questions.length}`);

  document.getElementById("submitBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "none";

  const buttonContainer = document.querySelector(".button-container");

  const takeAgainButton = document.createElement("button");
  takeAgainButton.textContent = "Take Quiz Again";
  takeAgainButton.className = "primary-button";
  takeAgainButton.addEventListener("click", () => window.location.reload());

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save Quiz";
  saveButton.className = "secondary-button";
  saveButton.addEventListener("click", () => promptAndSaveQuiz(questions));

  buttonContainer.appendChild(takeAgainButton);
  buttonContainer.appendChild(saveButton);

  try {
    const quizzesCollection = collection(db, "users", userId, "quizzes");
    const quizQuery = query(
      quizzesCollection,
      where("questions", "==", JSON.stringify(questions))
    );
    const existingQuizSnapshot = await getDocs(quizQuery);

    const quizData = {
      quizName,
      timestamp: new Date(),
      score,
      totalQuestions: questions.length,
      answered: true,
      questions: questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.answer,
        userAnswer: scores[index],
      })),
    };

    if (!existingQuizSnapshot.empty) {
      const quizDocRef = existingQuizSnapshot.docs[0].ref;
      await updateDoc(quizDocRef, quizData);
    } else {
      await addDoc(quizzesCollection, quizData);
    }
  } catch (error) {
    console.error("Error saving quiz details:", error);
    alert("Error saving quiz details. Please try again.");
  }
}

async function promptAndSaveQuiz(questions) {
  const quizName = prompt("Enter quiz name to save quiz:");
  if (quizName) {
    try {
      const isUnique = await checkQuizNameUniqueness(quizName);

      if (isUnique) {
        await saveQuiz(quizName, questions);
        alert("Quiz saved successfully!");

        window.location.href =
          "../../../../InstaQuiz/html/sidebars/sd_quizzes.html";
      } else {
        alert("Quiz name is already taken. Please choose another name.");
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Error saving quiz. Please try again.");
    }
  } else {
    alert("No quiz name entered. Quiz not saved.");
  }
}

async function checkQuizNameUniqueness(quizName) {
  const userId = localStorage.getItem("loggedInUserId");
  const quizzesCollection = collection(db, "users", userId, "quizzes");

  const querySnapshot = await getDocs(quizzesCollection);
  let isUnique = true;

  querySnapshot.forEach((doc) => {
    if (doc.data().quizName === quizName) {
      isUnique = false;
    }
  });

  return isUnique;
}

async function saveQuiz(quizName, questions) {
  const userId = localStorage.getItem("loggedInUserId");
  const quizzesCollection = collection(db, "users", userId, "quizzes");

  await addDoc(quizzesCollection, {
    quizName,
    timestamp: new Date(),
    questions,
    answered: false,
  });
}
