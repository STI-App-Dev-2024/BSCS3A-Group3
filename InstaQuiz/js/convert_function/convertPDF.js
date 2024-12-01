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

 
document.querySelector('.convert-btn').addEventListener('click', async () => {
    const questionCount = document.getElementById('questionCount').value;
    const fileInput = document.getElementById('fileInput');

    if (fileInput.files.length === 0) {
        alert('Please upload a file before converting.');
        return;
    }

    const file = fileInput.files[0];
    
    const formData = new FormData();
    formData.append('files[]', file);   
    formData.append('questionCount', questionCount);
    
    try {
        const response = await fetch('http://127.0.0.1:5000/convert', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Invalid response format');
        }

        displayQuestions(data.questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Error fetching questions. Please try again.');
    }
});

 
function displayQuestions(questions) {
    const content = document.querySelector('.content');  
    content.innerHTML = '<h2>Quiz Questions</h2>';
    console.log("Received Questions:", questions);   

    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.innerHTML = `<p>${index + 1}. ${question.question}</p>`;

        question.options.forEach((option, optionIndex) => {
            const optionLetter = String.fromCharCode(65 + optionIndex);  
            questionElement.innerHTML += `
                <label>
                    <input type="radio" name="question${index}" value="${optionLetter}"> ${option}
                </label><br>`;
        });

        content.appendChild(questionElement);
    });

    const submitButton = document.createElement('button');
    submitButton.id = 'submitBtn';
    submitButton.textContent = 'Submit';
    content.appendChild(submitButton);

    
    const saveButton = document.createElement('button');
    saveButton.id = 'saveBtn';
    saveButton.textContent = 'Save';
    content.appendChild(saveButton);

    submitButton.addEventListener('click', () => {
        calculateScores(questions);
    });

    saveButton.addEventListener('click', async () => {
        const folderName = prompt("Enter folder name to save quiz:");

        if (folderName) {
            await saveQuizToFolder(folderName, questions);
        } else {
            alert('No folder name entered. Quiz not saved.');
        }
    });
}


















 
async function saveQuizToFolder(questions) {
    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) {
        alert('User not logged in!');
        return;
    }

    
    const folderList = await getFolders(userId);
    const content = document.querySelector('.content');  
    content.innerHTML = '<h2>Select a Folder to Save Quiz</h2>';

    if (folderList.length === 0) {
        const createFolder = confirm('No folders exist. Would you like to create a new folder?');
        if (createFolder) {
            const folderName = prompt('Enter a name for the new folder:');
            if (folderName) {
                await createNewFolder(userId, folderName, questions);
            } else {
                alert('Folder creation cancelled.');
            }
        } else {
            alert('Quiz not saved.');
        }
    } else {
        folderList.forEach((folderName) => {
            const folderButton = document.createElement('button');
            folderButton.textContent = folderName;
            folderButton.addEventListener('click', async () => {
                await saveQuizToExistingFolder(userId, folderName, questions);
            });
            content.appendChild(folderButton);
        });

       
        const createNewFolderButton = document.createElement('button');
        createNewFolderButton.textContent = 'Create New Folder';
        createNewFolderButton.addEventListener('click', async () => {
            const folderName = prompt('Enter a name for the new folder:');
            if (folderName) {
                await createNewFolder(userId, folderName, questions);
            } else {
                alert('Folder creation cancelled.');
            }
        });
        content.appendChild(createNewFolderButton);
    }
}

 
async function getFolders(userId) {
    const foldersSnapshot = await getDocs(collection(db, 'users', userId, 'folders'));
    const folderList = [];
    foldersSnapshot.forEach((doc) => {
        folderList.push(doc.id);   
    });
    return folderList;
}

 
async function saveQuizToExistingFolder(userId, folderName, questions) {
    const folderRef = doc(db, 'users', userId, 'folders', folderName);
    const folderDoc = await getDoc(folderRef);

    if (!folderDoc.exists()) {
        alert(`Folder "${folderName}" does not exist. Please create the folder first.`);
        return;
    }

    const quizData = {
        timestamp: new Date(),
        score: 0,  
        questions: questions.map((q, index) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.answer,
        })),
    };

    const quizRef = doc(db, 'users', userId, 'folders', folderName, 'quizzes', `quiz-${Date.now()}`);
    await setDoc(quizRef, quizData);
    alert('Quiz saved successfully in the folder!');

    
    window.location.href = "http://127.0.0.1:5500/BSCS3A-InstaQuiz/InstaQuiz/html/sidebars/sd_quizzes.html";
}
 
async function createNewFolder(userId, folderName, questions) {
    const folderRef = doc(db, 'users', userId, 'folders', folderName);
    await setDoc(folderRef, { name: folderName, created: new Date() });
    alert(`Folder "${folderName}" created successfully!`);

    
    await saveQuizToExistingFolder(userId, folderName, questions);
}




// Function to calculate scores
async function calculateScores(questions) {
    const scores = {};
    let score = 0;

    questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
        if (selectedOption) {
            scores[index] = selectedOption.value;
            if (selectedOption.value === question.answer) {
                score++;
            }
        }
    });

    try {
        const response = await fetch('http://127.0.0.1:5000/submit-quiz', {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scores, questions }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        alert(`Your score: ${result.score}`);

        // Save quiz results to Firestore
        const userId = localStorage.getItem('loggedInUserId');
        if (!userId) {
            alert('User not logged in!');
            return;
        }

        await saveQuizToFolder(questions);

    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz. Please try again.');
    }
}
