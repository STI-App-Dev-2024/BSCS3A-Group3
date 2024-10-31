from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)


@app.route('/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()  
        question_count = int(data['questionCount'])
        question_type = data['questionType']
    
        # Temporary Logic to generate questions based on the input
        questions = generate_questions(question_count, question_type)
    
        return jsonify({'questions': questions})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def generate_questions(count, q_type):
    questions = []
    
    if q_type == 'multipleChoice':
        for i in range(count):
            question = f"What is the capital of country {i + 1}?"
            options = ["Option A", "Option B", "Option C", "Option D"]
            correct_answer = random.choice(options)
            questions.append({
                'question': question,
                'options': options,
                'answer': correct_answer
            })
    
    elif q_type == 'fillInTheBlanks':
        for i in range(count):
            question = f"The capital of country {i + 1} is ____."
            questions.append({'question': question, 'answer': "Capital Name"})  # Placeholder for the answer
    
    elif q_type == 'trueFalse':
        for i in range(count):
            question = f"Statement {i + 1}: The sun rises in the east."
            correct_answer = random.choice(["True", "False"])
            questions.append({
                'question': question,
                'answer': correct_answer
            })
    
    return questions

if __name__ == '__main__':
    app.run(debug=True)
