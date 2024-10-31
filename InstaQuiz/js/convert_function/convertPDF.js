document.querySelector('.convert-btn').addEventListener('click', async () => {
    const questionCount = document.getElementById('questionCount').value;
    const questionType = document.querySelector('input[name="questionType"]:checked').value;

    try {
        const response = await fetch('http://127.0.0.1:5000/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ questionCount, questionType }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        displayQuestions(data.questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Error fetching questions. Please try again.');
    }
});

function displayQuestions(questions) {
    const content = document.querySelector('.content');
    content.innerHTML = '<h2>Quiz Questions</h2>';
    
    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.innerHTML = `<p>${index + 1}. ${question.question}</p>`;
        
        if (question.type === 'multipleChoice') {
            question.options.forEach(option => {
                questionElement.innerHTML += `<label><input type="radio" name="question${index}" value="${option}"> ${option}</label>`;
            });
        } else if (question.type === 'fillInTheBlanks') {
            questionElement.innerHTML += `<input type="text" placeholder="Your answer" name="question${index}">`;
        } else if (question.type === 'trueFalse') {
            questionElement.innerHTML += `<label><input type="radio" name="question${index}" value="True"> True</label>`;
            questionElement.innerHTML += `<label><input type="radio" name="question${index}" value="False"> False</label>`;
        }
        content.appendChild(questionElement);
    });
    
    content.innerHTML += '<button id="submitBtn">Submit</button>';
    
    document.getElementById('submitBtn').addEventListener('click', () => {
        calculateScores(questions);
    });
}

async function calculateScores(questions) {
    const scores = {};
    questions.forEach((question, index) => {
        const selected = document.querySelector(`input[name="question${index}"]:checked`) || 
                         document.querySelector(`input[name="question${index}"]`).value;
        if (selected) {
            scores[`question${index}`] = selected.value || selected;
        }
    });

    try {
        const response = await fetch('http://127.0.0.1:5000/submit-quiz', {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scores }),
        });

        const result = await response.json();
        alert(`Your score: ${result.score}`);
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz. Please try again.');
    }
}

