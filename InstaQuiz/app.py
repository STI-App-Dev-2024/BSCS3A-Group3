from flask import Flask, jsonify, request
from flask_cors import CORS
import spacy
from collections import Counter
import random
import PyPDF2
import nltk
import re

nltk.download('wordnet')
from nltk.corpus import wordnet

app = Flask(__name__)
CORS(app)

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

 
# Function to find synonyms using WordNet
def find_similar_words(word):
    synonyms = set()
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name())
    return list(synonyms)



def generate_mcq(text, num_questions=5):
    if not text or text.strip() == "":
        return []

    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents if len(sent.text.split()) > 3]
    num_questions = min(num_questions, len(sentences))
    selected_sentences = random.sample(sentences, num_questions)

    # List of random names or nouns to use for invalid options
    random_names_or_nouns = ["John", "Alice", "chair", "mountain", "dog", "book", "car", "tree", "planet"]

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
        
        # Find similar words for distractors
        distractors = find_similar_words(subject)
        
        # Remove the correct answer from distractors
        distractors = list(set(distractors) - {subject})
        
        if len(distractors) < 3:
            # If not enough synonyms, add random nouns or names as distractors
            distractors += random.sample(random_names_or_nouns, min(3, len(random_names_or_nouns)))

        # Ensure no overlap with the correct answer
        distractors = [d for d in distractors if d != subject]

        # Filter out overly similar distractors (e.g., "UN" and "The United Nations")
        distractors = [d for d in distractors if not are_similar(d, subject)]

        # Shuffle distractors and add them to the choices
        random.shuffle(distractors)
        
        # Ensure we have 3 additional distractors, so the total choices are 4
        answer_choices += distractors[:3]
        
        # Shuffle all answer choices
        random.shuffle(answer_choices)

        # Ensure that no duplicate answers exist in the choices
        answer_choices = list(set(answer_choices))

        # If we don't have 4 choices after filtering, add random names or nouns
        while len(answer_choices) < 4:
            answer_choices.append(random.choice(random_names_or_nouns))

        # Get the correct answer index
        correct_answer = chr(65 + answer_choices.index(subject))

        questions.append({
            'question': question_stem,
            'options': answer_choices,
            'answer': correct_answer
        })

    return questions


# Helper function to check if two answers are too similar
def are_similar(answer1, answer2):
    return answer1.lower() == answer2.lower() or answer1 in answer2 or answer2 in answer1















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
        # For True/False, generate more contextually diverse questions
        question_stem = f"Is the following statement true or false?\n{sentence}"
        correct_answer = random.choice(["True", "False"])

        questions.append({
            'question': question_stem,
            'options': ["True", "False"],
            'answer': correct_answer
        })

    return questions

# Clean the extracted text to avoid formulas
def clean_text(text):
    # Remove common mathematical formulas or any text with 'E=mc^2' pattern
    text = re.sub(r'\bE\s*=\s*mc\^2\b', '', text)
    text = re.sub(r'[0-9]+[\s]*[a-zA-Z]+[\s]*=[\s]*[a-zA-Z]+[\^][0-9]+', '', text)  # generic formula pattern
    return text

# Process PDF and extract text
def process_pdf(file):
    text = ""
    pdf_reader = PyPDF2.PdfReader(file)
    for page_num in range(len(pdf_reader.pages)):
        page_text = pdf_reader.pages[page_num].extract_text()
        text += page_text
    return text

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

    # Clean the extracted text to avoid formulas
    text = clean_text(text)

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

if __name__ == '__main__':
    app.run(debug=True)
