from flask import Flask, request, jsonify
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


@app.route("/users", methods=["POST"])
def add_user():
    try:
        data = request.json

        result = users.insert_one(data)

        return jsonify({"message": "User added", "user_id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/users/<id>", methods=["PATCH"])
def update_user(id):
    try:
        user_id = ObjectId(id)
        data = request.json

        update = {}

        for field in data:
            update[field] = data[field]

        result = users.update_one({"_id": user_id}, {"$set": update})

        if result.matched_count == 1:
            return jsonify({"message": "User updated successfully."}), 200
        else:
            return jsonify({"message": "User not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 

@app.route("/users/<id>", methods=["GET"])
def get_user(id): 
    try:
        user_id = ObjectId(id)
        user = users.find_one({"_id": user_id})

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
                "_id": user['_id']  # Including the ID of the user
            }

            user_list.append(user_details)

        # Return the list of users as a JSON response
        return jsonify(user_list), 200

    except Exception as e:
        # Handle any errors that occur during the process
        return jsonify({"error": str(e)}), 


@app.route("/users/<id>", methods=["DELETE"])
def delete_user(id):
    try:
        user_id = ObjectId(id)
        result = users.delete_one({"_id": user_id})

        if result.deleted_count == 1:
            return jsonify({"message": f"User with ID {id} was deleted successfully."}), 200
        else:
            return jsonify({"message": f"User with ID {id} not found."}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 


if __name__ == "__main__":
    app.run(debug=True) 