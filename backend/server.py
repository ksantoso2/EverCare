import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import openai
from werkzeug.utils import secure_filename
import tempfile
from dotenv import load_dotenv
import uuid

load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')
openai_client = openai.OpenAI()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["demo"]
users = db["users"]
entries = db["entries"]

# Allowed file extensions for audio upload
ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg", "webm"}

# Function to check allowed file extensions
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Create user
@app.route("/users", methods=["POST"])
def add_user():
    try:
        data = request.json
        result = users.insert_one(data)
        return jsonify({"message": "User added", "user_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Get all users
@app.route("/users", methods=["GET"])
def get_users():
    try:
        user_list = []
        for user in users.find():
            user_list.append({"_id": str(user["_id"]), "name": user.get("name", "N/A"), "age": user.get("age", "N/A"), "username": user.get("username", "N/A")})
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Add entry
@app.route("/entries", methods=["POST"])
def add_entry():
    try:
        data = request.json
        username = data.get("username")
        entry = data.get("entry")

        if not username or not entry:
            return jsonify({"error": "Username and entry are required"}), 400

        entries.insert_one({"username": username, "entry": entry})
        return jsonify({"message": "Entry added"}), 201
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 400

# Get entries for a user
@app.route("/entries/<username>", methods=["GET"])
def get_user_entries(username):
    try:
        user_entries = list(entries.find({"username": username}, {"_id": 0, "entry": 1}))
        return jsonify(user_entries), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Get all entries
@app.route("/entries", methods=["GET"])
def get_entries():
    try:
        cursor = entries.find()
        entries_list = []
        for entry in cursor:
            entry['_id'] = str(entry['_id'])
            entries_list.append({
                "username": entry.get("username", "N/A"),
                "entry": entry.get("entry", "N/A"),
                "_id": entry['_id']
            })
        return jsonify(entries_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint for transcribing audio
@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files["audio"]
    username = request.form.get("username")  # Extract username from FormData

    # if audio_file.filename == "" or not allowed_file(audio_file.filename):
    #     if audio_file.filename == "":
    #         app.logger.error("no audio filename")
    #     if not allowed_file(audio_file.filename):
    #         app.logger.error(f"file {audio_file.filename} not allowed")
    #     return jsonify({"error": "Invalid file type. Allowed types are wav, mp3, ogg, webm."}), 400
    
    if not username:
        return jsonify({"error": "Username is required"}), 400

    try:
        filename = f"{str(uuid.uuid4())}.wav"
        os.makedirs("temp_audio", exist_ok=True)
        file_path = os.path.join("temp_audio", filename)
        audio_file.save(file_path)

        file = open(file_path, "rb")
        # audio_bytes = audio_file.read()

        transcription = openai_client.audio.transcriptions.create(
            model="whisper-1", 
            file=file
        )

        entries.insert_one({"username": username, "entry": transcription.text})

        return jsonify({'text': transcription.text})
        # return jsonify({"message": "Transcription successful", "text": transcription.text}), 200

    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500
    finally:
        file.close()
        os.remove(file_path)

if __name__ == "__main__":
    app.run(debug=True)
