from flask import Flask, jsonify, request
from flask_cors import CORS
import spacy
from collections import Counter
import random
import PyPDF2
import nltk

nltk.download('wordnet')
from nltk.corpus import wordnet

app = Flask(__name__)
CORS(app)

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

# Function to find synonyms using WordNet
def find_similar_words(word):
    synonyms = []
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.append(lemma.name())
    return list(set(synonyms))

# Function for generating MCQs
def generate_mcq(text, num_questions=5):
    if not text or text.strip() == "":
        return []

    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents if len(sent.text.split()) > 3]
    num_questions = min(num_questions, len(sentences))
    selected_sentences = random.sample(sentences, num_questions)

    questions = []

    for sentence in selected_sentences:
        sent_doc = nlp(sentence)

        # Extract entities or fallback to nouns
        entities = [ent.text for ent in sent_doc.ents if ent.label_ in {"PERSON", "ORG", "GPE", "DATE", "NORP"}]
        if not entities:
            entities = [token.text for token in sent_doc if token.pos_ == "NOUN"]

        if len(entities) < 1:
            continue

        entity_counts = Counter(entities)
        subject = entity_counts.most_common(1)[0][0]
        question_stem = sentence.replace(subject, "______")

        # Generate answer choices
        answer_choices = [subject]
        distractors = find_similar_words(subject)
        distractors = list(set(distractors) - {subject})
        if len(distractors) < 3:
            distractors += random.sample(entities, min(3, len(entities)))

        random.shuffle(distractors)
        answer_choices += distractors[:3]
        random.shuffle(answer_choices)

        correct_answer = chr(65 + answer_choices.index(subject))

        questions.append({
            'question': question_stem,
            'options': answer_choices,
            'answer': correct_answer
        })

    return questions

# Function for generating fill-in-the-blank questions
def generate_fill_in_the_blank(text, num_questions=5):
    if not text or text.strip() == "":
        return []

    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents if len(sent.text.split()) > 3]
    num_questions = min(num_questions, len(sentences))
    selected_sentences = random.sample(sentences, num_questions)

    questions = []

    for sentence in selected_sentences:
        sent_doc = nlp(sentence)

        entities = [ent.text for ent in sent_doc.ents if ent.label_ in {"PERSON", "ORG", "GPE", "DATE", "NORP"}]
        if not entities:
            entities = [token.text for token in sent_doc if token.pos_ == "NOUN"]

        if len(entities) < 1:
            continue

        entity_counts = Counter(entities)
        subject = entity_counts.most_common(1)[0][0]
        question_stem = sentence.replace(subject, "______")

        questions.append({
            'question': question_stem,
            'answer': subject
        })

    return questions

# Function for generating True/False questions
def generate_true_false(text, num_questions=5):
    if not text or text.strip() == "":
        return []

    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents if len(sent.text.split()) > 3]
    num_questions = min(num_questions, len(sentences))
    selected_sentences = random.sample(sentences, num_questions)

    questions = []

    for sentence in selected_sentences:
        question_stem = "Is the following statement true or false?\n" + sentence
        correct_answer = random.choice(["True", "False"])

        questions.append({
            'question': question_stem,
            'options': ["True", "False"],
            'answer': correct_answer
        })

    return questions

@app.route('/convert', methods=['POST'])
def convert():
    text = ""

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
        text = request.form.get('text', '')

    if not text.strip():
        return jsonify({'error': 'No text provided for conversion.'}), 400

    num_questions = int(request.form.get('questionCount', 5))
    if num_questions < 1:
        return jsonify({'error': 'Number of questions must be at least 1.'}), 400

    question_type = request.form.get('questionType', 'mcq').lower()

    if question_type == 'mcq':
        questions = generate_mcq(text, num_questions)
    elif question_type == 'fill_in_the_blanks':
        questions = generate_fill_in_the_blank(text, num_questions)
    elif question_type == 'true_false':
        questions = generate_true_false(text, num_questions)
    else:
        return jsonify({'error': 'Invalid question type. Please choose mcq, fill_in_the_blanks, or true_false.'}), 400

    return jsonify({'questions': questions})

@app.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.json
    scores = data.get('scores', {})
    questions = data.get('questions', [])
    correct_count = 0

    for key, selected_answer in scores.items():
        if key.isdigit() and int(key) < len(questions):
            correct_answer = questions[int(key)]['answer']
            if selected_answer == correct_answer:
                correct_count += 1

    return jsonify({'score': correct_count})

def process_pdf(file):
    text = ""
    pdf_reader = PyPDF2.PdfReader(file)
    for page_num in range(len(pdf_reader.pages)):
        page_text = pdf_reader.pages[page_num].extract_text()
        text += page_text

    return text

if __name__ == '__main__':
    app.run(debug=True)
