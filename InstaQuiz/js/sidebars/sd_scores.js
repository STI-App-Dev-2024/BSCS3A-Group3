
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


function createScoresChart(quizData) {
   
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }

    const chartElement = document.getElementById('scoresChart');
    if (!chartElement) {
        console.error('Chart canvas not found');
        return;
    }

    const ctx = chartElement.getContext('2d');
    
    
    const labels = quizData.map(item => item.quizName || 'Unnamed Quiz');
    const scores = quizData.map(item => item.score || 0);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quiz Scores',
                data: scores,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Score'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Your Quiz Scores'
                }
            }
        }
    });
}

// Fetch user's quiz scores
async function fetchUserScores() {
    return new Promise((resolve, reject) => {
        // Initialize Firebase
        const firebase = initializeFirebase();
        
        if (!firebase) {
            console.error('Firebase initialization failed');
            reject(new Error('Firebase initialization failed'));
            return;
        }

        const { db, auth } = firebase;

        // Use onAuthStateChanged safely
        const unsubscribe = onAuthStateChanged(
            auth, 
            async (user) => {
                // Unsubscribe immediately to prevent multiple listeners
                unsubscribe();

                if (user) {
                    try {
                        // Reference to the user's quizzes collection
                        const quizzesRef = collection(db, 'users', user.uid, 'quizzes');
                        
                        // Get all quiz documents
                        const quizzesSnapshot = await getDocs(quizzesRef);
                        
                        // Convert snapshot to array of quiz data
                        const quizData = quizzesSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));

                        // Create chart if we have data
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
            },
            (error) => {
                console.error('Auth state change error:', error);
                reject(error);
            }
        );
    });
}

// Call the function to fetch and display scores
document.addEventListener('DOMContentLoaded', () => {
    fetchUserScores().catch(error => {
        console.error('Failed to fetch user scores:', error);
        
        // Optionally, display a user-friendly message
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <p>Unable to load scores. Please try again later.</p>
            `;
        }
    });
});

// Export the function in case it's needed elsewhere
export { fetchUserScores };