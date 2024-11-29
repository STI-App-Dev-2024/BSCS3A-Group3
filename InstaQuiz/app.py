from flask import Flask, jsonify, request
from flask_cors import CORS
import spacy
from collections import Counter
import random
import PyPDF2

app = Flask(__name__)
CORS(app)

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

def generate_mcq(text, num_questions=5):
    if not text or text.strip() == "":
        return []

    # Process the text with spaCy
    doc = nlp(text)

    # Extract sentences with sufficient length
    sentences = [sent.text for sent in doc.sents if len(sent.text.split()) > 3]
    num_questions = min(num_questions, len(sentences))
    selected_sentences = random.sample(sentences, num_questions)

    questions = []

    for sentence in selected_sentences:
        sent_doc = nlp(sentence)

        # Extract entities or nouns to use as the subject
        entities = [ent.text for ent in sent_doc.ents if ent.label_ in {"PERSON", "ORG", "GPE", "DATE", "NORP"}]
        if not entities:
            entities = [token.text for token in sent_doc if token.pos_ == "NOUN"]

        if len(entities) < 1:
            continue

        # Determine the subject and generate question
        entity_counts = Counter(entities)
        subject = entity_counts.most_common(1)[0][0]
        question_stem = sentence.replace(subject, "______")

        # Generate distractors and answer choices
        answer_choices = [subject]
        distractors = list(set(entities) - {subject})
        if len(distractors) < 3:
            distractors += random.sample(entities, min(3, len(entities)))

        random.shuffle(distractors)
        answer_choices += distractors[:3]
        random.shuffle(answer_choices)

        # Determine the correct answer
        correct_answer = chr(65 + answer_choices.index(subject))

        # Append the question to the list
        questions.append({
            'question': question_stem,
            'options': answer_choices,
            'answer': correct_answer
        })

    return questions

@app.route('/convert', methods=['POST'])
def convert():
    text = ""

    # Check for uploaded files
    if 'files[]' in request.files:
        files = request.files.getlist('files[]')
        for file in files:
            if file.filename.endswith('.pdf'):
                text += process_pdf(file)
            elif file.filename.endswith('.txt'):
                text += file.read().decode('utf-8')
            else:
                return jsonify({'error': 'Unsupported file type. Please upload PDF or TXT files.'}), 400
    else:
        # Handle manual text input
        text = request.form.get('text', '')

    # Get the number of questions from the request
    num_questions = int(request.form.get('questionCount', 5))
    if num_questions < 1:
        return jsonify({'error': 'Number of questions must be at least 1.'}), 400

    # Generate MCQs
    mcqs = generate_mcq(text, num_questions=num_questions)

    return jsonify({'questions': mcqs})

@app.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.json
    scores = data.get('scores', {})
    questions = data.get('questions', [])
    correct_count = 0

    for key, selected_answer in scores.items():
        if key.isdigit() and int(key) < len(questions):
            correct_answer = questions[int(key)]['answer']  # Correct answer is a letter
            if selected_answer == correct_answer:  # Compare selected answer with correct letter
                correct_count += 1

    return jsonify({'score': correct_count})



def process_pdf(file):
    # Extract text from PDF
    text = ""
    pdf_reader = PyPDF2.PdfReader(file)
    for page_num in range(len(pdf_reader.pages)):
        page_text = pdf_reader.pages[page_num].extract_text()
        text += page_text

    return text

if __name__ == '__main__':
    app.run(debug=True)
