from flask import Flask, request
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient('mongodb://localhost:27017/') 
db = client['demo'] 
collection = db['data']


@app.route("/members")
def members():
    return {"members": ["Member1", "Member2", "Member3"]}

@app.route('/add_data', methods=['POST']) 
def add_data(): 
    # Get data from request 
    data = request.json 
  
    # Insert data into MongoDB 
    collection.insert_one(data) 
  
    return 'Data added to MongoDB'

if __name__ == "__main__":
    app.run(debug=True) 