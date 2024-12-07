import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

let firebaseInitialized = false;

export const firebaseConfig = {
    apiKey: "AIzaSyDoLbJdlLUsfMp09PwA_31TYcetC3JxIWs",
    authDomain: "instaquiz-37134.firebaseapp.com",
    projectId: "instaquiz-37134",
    storageBucket: "instaquiz-37134.appspot.com",
    messagingSenderId: "78078580689",
    appId: "1:78078580689:web:0184ebf9d3896a3b20b2f0"
};

function initializeFirebase() {
    if (!firebaseInitialized) {
        try {
            const app = initializeApp(firebaseConfig);
            firebaseInitialized = true;
            console.log('Firebase initialized successfully');
            return {
                db: getFirestore(app),
                auth: getAuth(app)
            };
        } catch (error) {
            console.error("Firebase initialization error:", error);
            return null;
        }
    }
    return null;
}

async function fetchUserScores() {
    return new Promise((resolve, reject) => {
        const firebase = initializeFirebase();
        if (!firebase) {
            console.error('Firebase initialization failed');
            reject(new Error('Firebase initialization failed'));
            return;
        }

        const { db, auth } = firebase;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (user) {
                try {
                    const quizzesRef = collection(db, 'users', user.uid, 'quizzes');
                    const quizzesSnapshot = await getDocs(quizzesRef);
                    const quizData = quizzesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    if (quizData.length > 0) {
                        createScoresChart(quizData);  
                        resolve(quizData);
                    } else {
                        console.log('No quiz scores found');
                        resolve([]);
                    }
                } catch (error) {
                    console.error("Error fetching quiz scores:", error);
                    reject(error);
                }
            } else {
                console.log('No user logged in');
                reject(new Error('No user logged in'));
            }
        }, (error) => {
            console.error('Auth state change error:', error);
            reject(error);
        });
    });
}

function createScoresChart(quizData) {
    const totalQuizzes = quizData.length;
    const highestScore = Math.max(...quizData.map(q => q.score), 0);
    const lowestScore = Math.min(...quizData.map(q => q.score), 100);

    
    document.getElementById('total-quizzes').textContent = totalQuizzes;
    document.getElementById('highest-score').textContent = highestScore;
    document.getElementById('lowest-score').textContent = lowestScore;

    const ctx = document.getElementById('scoreChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Quizzes', 'Highest Score', 'Lowest Score'],
            datasets: [{
                label: 'Quiz Stats',
                data: [totalQuizzes, highestScore, lowestScore],
                backgroundColor: ['blue', 'green', 'red'],
                borderColor: ['blue', 'green', 'red'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchUserScores().catch(error => {
        console.error('Failed to fetch user scores:', error);
    });
});
