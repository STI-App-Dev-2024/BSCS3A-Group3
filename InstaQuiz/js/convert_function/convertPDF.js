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
    const content = document.querySelector('.content'); // Ensure this selector matches the element where questions should appear
    content.innerHTML = '<h2>Quiz Questions</h2>';
    console.log("Received Questions:", questions);  // Debugging line

    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.innerHTML = `<p>${index + 1}. ${question.question}</p>`;

        question.options.forEach((option, optionIndex) => {
            const optionLetter = String.fromCharCode(65 + optionIndex); // Convert 0,1,2,3 to A,B,C,D
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

    submitButton.addEventListener('click', () => {
        calculateScores(questions);
    });
}

async function calculateScores(questions) {
    const scores = {};

    questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
        if (selectedOption) {
            scores[index] = selectedOption.value;  // Use numeric keys
        }
    });

    try {
        const response = await fetch('http://127.0.0.1:5000/submit-quiz', {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scores, questions }),  // Include questions in payload
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        alert(`Your score: ${result.score}`);
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz. Please try again.');
    }
}
