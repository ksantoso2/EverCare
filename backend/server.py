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
import requests

load_dotenv()

# Set up API keys
openai.api_key = os.getenv('OPENAI_API_KEY')
openai_client = openai.OpenAI()

perplexity_api_key = os.getenv('PERPLEXITY_API_KEY')
perplexity_url = "https://api.perplexity.ai/chat/completions"
# perplexity_client = openai.OpenAI(api_key=perplexity_api_key, base_url="https://api.perplexity.ai")


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
    
# Get user by username
@app.route("/users/<username>", methods=["GET"])
def get_user(username): 
    try:
        user = users.find_one({"username": username})
        if user is None:
            return jsonify({"message": "User not found"}), 404

        user['_id'] = str(user['_id'])

        return jsonify(user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 


@app.route("/users/<username>", methods=["PATCH"])
def update_user(username):
    try:
        data = request.json
        update = {}
        for field in data:
            update[field] = data[field]

        result = users.update_one({"username": username}, {"$set": update})
        if result.matched_count == 1:
            return jsonify({"message": "User updated successfully."}), 200
        else:
            return jsonify({"message": "User not found."}), 404
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

# Transcribing audio inputs
@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files["audio"]
    username = request.form.get("username")  

    if not username:
        return jsonify({"error": "Username is required"}), 400

    try:
        filename = f"{str(uuid.uuid4())}.wav"
        os.makedirs("temp_audio", exist_ok=True)
        file_path = os.path.join("temp_audio", filename)
        audio_file.save(file_path)

        file = open(file_path, "rb")

        transcription = openai_client.audio.transcriptions.create(
            model="whisper-1", 
            file=file
        )

        entries.insert_one({"username": username, "entry": transcription.text})

        return jsonify({'text': transcription.text})

    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500
    finally:
        file.close()
        os.remove(file_path)


@app.route("/perplexity", methods=["POST"])
def perplexity():
    data = request.json

    username = data.get("username")
    user_info = requests.request("GET", f"http://localhost:5000/users/{username}").json()

    user_entries = requests.request("GET", f"http://localhost:5000/entries/{username}").json()
    

    # System Prompt
    system_prompt = {
        "role": "system",
        "content": (
            f"The user is {user_info["age"]} years old."
            "Give general advice for at-home relief methods for user's symptoms and condition, given their age, but don't tell them what to do."
            "Emphasize that they should consult their healthcare provider for concerns."
        ),
    }

    # User Prompt
    user_prompt = {
        "role": "user",
        "content": data.get("input"),
    }

    payload = {
        "model": "sonar",
        "messages": [system_prompt, user_prompt],
    }
    headers = {
        "Authorization": "Bearer " + perplexity_api_key,
        "Content-Type": "application/json"
    }

    response = requests.request("POST", perplexity_url, json=payload, headers=headers)

    if response.status_code == 200:
        # Return the JSON response from the external API
        return jsonify(response.json())
    else:
        # If there is an error, return an appropriate error message
        return jsonify({
        "error": f"Failed to get a response from the perplexity service: {response.status_code} - {response.text}"
    }), 500


if __name__ == "__main__":
    app.run(debug=True)
