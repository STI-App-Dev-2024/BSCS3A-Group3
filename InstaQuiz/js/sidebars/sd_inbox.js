import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDoc,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  setDoc,
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
    const sharedRef = collection(db, "users", userId, "shared");
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
        quizElement.id = doc.id;
        quizElement.innerHTML = `
          </p><strong style="font-size: 1.1em">
           ${
             quiz.sharedDetails[0]?.subject
               ? quiz.sharedDetails[0].subject.length > 50
                 ? quiz.sharedDetails[0].subject.substring(0, 50) + "..."
                 : quiz.sharedDetails[0].subject
               : "No message provided"
           }</strong></p>

          <p style="font-size: 0.96em"><strong>From:</strong> ${
            quiz.sharedDetails[0]?.senderFirstName || "Unknown"
          } ${quiz.sharedDetails[0]?.senderLastName || ""}
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

// Handleclick for shared quizzes
const shareQuizzesContainer = document.getElementById(
  "shared-quizzes-container"
);

// Shared quiz id
let previousQuizId;
let sharedQuizId = null;

shareQuizzesContainer.addEventListener("click", HandleClick);
async function HandleClick(event) {
  const elementId = event.target.id;
  if (elementId !== "shared-quizzes-container") {
    previousQuizId = sharedQuizId;
    sharedQuizId = elementId;

    if (previousQuizId == null) {
      const quizElement = document.getElementById(sharedQuizId);
      quizElement.style.background = "#95d69e";
    } else {
      const previousQuizElement = document.getElementById(previousQuizId);
      previousQuizElement.style.background = "#FFFFFF";

      const quizElement = document.getElementById(sharedQuizId);
      quizElement.style.background = "#95d69e";
    }
    // Gets the data and pass the details
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const sharedQuizRef = doc(db, "users", user.uid, "shared", elementId);
          const quizNameSnapshot = await getDoc(sharedQuizRef);

          // Gets the shared details
          const quizName = quizNameSnapshot.data().quizName;
          const subject = quizNameSnapshot.data().sharedDetails[0].subject;
          const from = quizNameSnapshot.data().sharedDetails[0].from;
          const senderFirstName =
            quizNameSnapshot.data().sharedDetails[0].senderFirstName;
          const senderLastName =
            quizNameSnapshot.data().sharedDetails[0].senderLastName;
          const message = quizNameSnapshot.data().sharedDetails[0].message;
          const status = quizNameSnapshot.data().sharedDetails[0].status;

          const QuizName = document.getElementById("quizName");
          const Subject = document.getElementById("subject");
          const From = document.getElementById("from");
          const Message = document.getElementById("message");

          if (status == "accepted") {
            const buttonContainer = document.getElementById("declined-btn");
            buttonContainer.style.display = "none";
            document.querySelector(".buttonContainer").style.display = "none";
            document.querySelector(".buttonContainer2").style.display = "flex";
            const declinedBtn = document.getElementById("accepted-btn");
            declinedBtn.style.display = "flex";
          } else if (status == "declined") {
            document.querySelector(".buttonContainer").style.display = "none";
            document.querySelector(".buttonContainer2").style.display = "flex";
            const acceptedBtn = document.getElementById("accepted-btn");
            acceptedBtn.style.display = "none";
            const declinedBtn = document.getElementById("declined-btn");
            declinedBtn.style.display = "flex";
          } else {
            document.querySelector(".buttonContainer").style.display = "flex";
            document.querySelector(".buttonContainer2").style.display = "none";
          }

          QuizName.textContent = quizName;
          Subject.textContent = subject;
          From.textContent = "from: " + senderFirstName + " " + senderLastName;
          Message.textContent = message;

          // Shows the container
          const shareQuizzesContainer = document.getElementById(
            "shared-quizzes-details-container"
          );
          shareQuizzesContainer.style.display = "flex";
        } catch (error) {
          console.error(error.message);
        }
      }
    });
  } else {
    // do nothing
  }
}

document.getElementById("accept-btn").onclick = function () {
  // Gets the data and pass the details
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const sharedQuizRef = doc(
          db,
          "users",
          user.uid,
          "shared",
          sharedQuizId
        );
        const sharedQuizSnapshot = await getDoc(sharedQuizRef);
        const quizData = sharedQuizSnapshot.data();
        const rootUserRef = collection(db, "users", user.uid, "quizzes");
        await addDoc(rootUserRef, quizData);

        quizData.sharedDetails[0].status = "accepted";

        await setDoc(sharedQuizRef, quizData, { merge: true });

        document.querySelector(".buttonContainer").style.display = "none";
        document.querySelector(".buttonContainer2").style.display = "flex";
      } catch (error) {
        console.error("Error fetching shared quiz data:", error);
      }
    }
  });
};

document.getElementById("decline-btn").onclick = function () {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const sharedQuizRef = doc(
          db,
          "users",
          user.uid,
          "shared",
          sharedQuizId
        );

        const sharedQuizSnapshot = await getDoc(sharedQuizRef);
        const quizData = sharedQuizSnapshot.data();
        quizData.sharedDetails[0].status = "declined";

        // updates the button
        document.querySelector(".buttonContainer").style.display = "none";
        document.querySelector(".buttonContainer2").style.display = "flex";
        const acceptedBtn = document.getElementById("accepted-btn");
        acceptedBtn.style.display = "none";
        const declinedBtn = document.getElementById("declined-btn");
        declinedBtn.style.display = "flex";

        await setDoc(sharedQuizRef, quizData, { merge: true });
      } catch (error) {
        console.error(error);
      }
    }
  });
};

document.getElementById("delete-btn").onclick = function () {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const sharedQuizRef = doc(
          db,
          "users",
          user.uid,
          "shared",
          sharedQuizId
        );
        await deleteDoc(sharedQuizRef);

        // deletes locally
        const clickedChild = document.getElementById(sharedQuizId);
        const container = document.getElementById("shared-quizzes-container");
        container.removeChild(clickedChild);

        // Hides the container
        const shareQuizzesContainer = document.getElementById(
          "shared-quizzes-details-container"
        );
        shareQuizzesContainer.style.display = "none";
      } catch (error) {
        console.error(error);
      }
    }
  });
};
