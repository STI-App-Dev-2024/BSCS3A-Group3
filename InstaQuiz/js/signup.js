// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase configuration
import { firebaseConfig } from '../js/firebase.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Get references to the form and input fields
const signupForm = document.getElementById('signup-form');
const firstNameInput = document.getElementById('first-name');
const middleNameInput = document.getElementById('middle-name');
const lastNameInput = document.getElementById('last-name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');

// Handle form submission
signupForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const firstName = firstNameInput.value;
    const middleName = middleNameInput.value;
    const lastName = lastNameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const userCredentials = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCredentials.user;

        console.log("User signed up : ",user);

        //update profile display with name
        await updateProfile(user, {
            displayName: `${firstName} ${middleName ? middleName + ` ` : ``} ${lastName}`
        });

        //save to firestore collection

        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            firstName: firstName,
            middleName: middleName || ``,
            lastName: lastName,
            email: email
        });
        
        //go to homepage or dashboard

        window.location.href = `homepage.html`;

    } catch (error){
        console.error("Error signing up: ",error.message);
        alert("Error signing up: "+error.message);
    }
    
});

     