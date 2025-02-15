from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)

client = MongoClient('mongodb://localhost:27017/') 
db = client['demo'] 
users = db['users']
entries = db['entries']

from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/login", methods=["POST"])
def login():
    # Get username from request body
    data = request.json
    username = data.get("username")
    
    if username:
        # Store the username in the session
        session['username'] = username
        return jsonify({"message": f"User {username} logged in successfully"}), 200
    else:
        return jsonify({"error": "Username is required"}), 400

@app.route("/chat", methods=["POST"])
def chat():
    if 'username' not in session:
        return jsonify({"error": "User not logged in"}), 401  # Unauthorized

    # Get the user input from the request
    data = request.json
    entry = data.get("entry")
    
    # Process the user input (chat logic can be added here)
    response = f"Hello {session['username']}, you said: {entry}"
    
    return jsonify({"response": response}), 200

@app.route("/logout", methods=["POST"])
def logout():
    # Clear the session
    session.pop('username', None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route("/users", methods=["POST"])
def add_user():
    try:
        data = request.json

        result = users.insert_one(data)

        return jsonify({"message": "User added", "user_id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
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
        return jsonify({"error": str(e)}), 

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

@app.route("/users", methods=["GET"])
def get_users(): 
    try:
        # Fetch all users from the collection
        cursor = users.find()

        # Create a list to hold the user data
        user_list = []

        # Loop through the cursor and add each user document to the list
        for user in cursor:
            # Convert the _id to string to make it JSON serializable
            user['_id'] = str(user['_id'])
            
            user_details = {
                "name": user.get("name", "N/A"),
                "age": user.get("age", "N/A"),
                "username": user.get("username", "N/A"),
                "_id": user['_id']  # Including the ID of the user
            }

            user_list.append(user_details)

        # Return the list of users as a JSON response
        return jsonify(user_list), 200

    except Exception as e:
        # Handle any errors that occur during the process
        return jsonify({"error": str(e)}), 


@app.route("/users/<username>", methods=["DELETE"])
def delete_user(username):
    try:
        result = users.delete_one({"username": username})

        if result.deleted_count == 1:
            return jsonify({"message": f"User with username {username} was deleted successfully."}), 200
        else:
            return jsonify({"message": f"User with username {username} not found."}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 


@app.route("/<username>/chat", methods=["POST"])
def add_entry(username):
    try: 
        data = request.json
        entry = data.get('entry')

        if not entry:
            return

        chat_data = {
            "username": username,
            "entry": entry
        }

        entries.insert_one(chat_data)

        return jsonify({"message": f"Entry added for user {username}"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 

if __name__ == "__main__":
    app.run(debug=True) 