from flask import Flask, request, jsonify
import json
import hashlib
from urllib.request import urlopen
import os

app = Flask(__name__)

def c_fsize():
    fsize = os.path.getsize("login.json") + os.path.getsize("data.json")
    if fsize > 1000000:
        return True
    return False

@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = '*'
    return response

def getRating(handle):
    try:
        with urlopen("https://codeforces.com/api/user.info?handles={}".format(handle)) as r:
            h_info = r.read()
    except:
        return -1
    h_info = json.loads(h_info)
    if h_info["status"] != "OK":
        return -1
    if "rating" not in h_info["result"][0]:
        return -1
    return int(h_info["result"][0]["rating"])

def getPrice(rating):
    return 1.002 ** rating

@app.route("/reg", methods = ["GET"])
def reg():
    if c_fsize():
        return "0"
    user = request.args.get("u")
    pwd = request.args.get("p")
    print("{} has registered".format(user))
    if user == "" or pwd == "" or user == None or pwd == None:
        return "0";

    logdat = {}
    with open("login.json") as f:
        logdat = json.load(f)
    if user in logdat:
        return "0"; 
    logdat[user] = hashlib.sha256(pwd.encode()).hexdigest();
    with open("login.json", "w") as f:
        json.dump(logdat, f);

    udat = {}
    with open("data.json") as f:
        udat = json.load(f)
    with open("data.json", "w") as f:
        udat[user] = {"$": 4000.0, "stonk": {}}
        json.dump(udat, f);

    return "1"

@app.route("/login", methods = ["GET"])
def login():
    if c_fsize():
        return "0"
    user = request.args.get("u")
    pwd = request.args.get("p")
    print("{} is trying to log in".format(user))

    if user == "" or pwd == "" or user == None or pwd == None:
        return "0";

    logdat = {}
    with open("login.json") as f:
        logdat = json.load(f)
    if user not in logdat:
        return "0"; 
    
    if logdat[user] != hashlib.sha256(pwd.encode()).hexdigest():
        return "0"

    return "1"

@app.route("/get", methods = ["GET"])
def get():
    if c_fsize():
        return "0"
    user = request.args.get("u")
    print("Retrieve {}".format(user))
    if user == "" or user == None:
        return "0"
    
    udat = {}
    with open("data.json") as f:
        udat = json.load(f)

    if user not in udat:
        return "0"

    return jsonify(udat[user])

@app.route("/invest", methods = ["GET"])
def invest():
    if c_fsize():
        return "0"
    handle = request.args.get("handle").lower()
    user = request.args.get("u")
    pwd = request.args.get("p")
    amt = request.args.get("amt")
    
    try:
        amt = int(amt)
    except:
        return "0"

    print("{} investing in {}".format(user, handle))
    if user == "" or pwd == "" or user == None or pwd == None:
        return "0"

    logdat = {}
    with open("login.json") as f:
        logdat = json.load(f)
    if user not in logdat:
        return "0"
    
    if logdat[user] != hashlib.sha256(pwd.encode()).hexdigest():
        return "0"
    
    rating = getRating(handle)
    if rating == -1:
        return "0"

    price = getPrice(rating)

    print("{} has a rating of {}, costing {}".format(handle, rating, price))
    
    udat = {}
    with open("data.json") as f:
        udat = json.load(f)
    
    if amt * price > udat[user]["$"] or amt <= 0:
        return "0"
    udat[user]["$"] -= amt * price
    
    if handle not in udat[user]["stonk"]:
        udat[user]["stonk"][handle] = 0
    udat[user]["stonk"][handle] += amt

    with open("data.json", "w") as f:
        json.dump(udat, f)

    return "1"

@app.route("/sell", methods = ["GET"])
def sell():
    if c_fsize():
        return "0"
    handle = request.args.get("handle").lower()
    user = request.args.get("u")
    pwd = request.args.get("p")
    amt = request.args.get("amt")
    
    try:
        amt = int(amt)
    except:
        return "0"

    print("{} selling {}".format(user, handle))
    if user == "" or pwd == "" or user == None or pwd == None:
        return "0"

    logdat = {}
    with open("login.json") as f:
        logdat = json.load(f)
    if user not in logdat:
        return "0"
    
    if logdat[user] != hashlib.sha256(pwd.encode()).hexdigest():
        return "0"
    
    rating = getRating(handle)
    if rating == -1:
        return "0"

    price = getPrice(rating)

    print("{} has a rating of {}, costing {}".format(handle, rating, price))
    
    udat = {}
    with open("data.json") as f:
        udat = json.load(f)
    
    if handle not in udat[user]["stonk"]:
        return "0"

    if amt > udat[user]["stonk"][handle] or amt <= 0:
        return "0"
    udat[user]["$"] += amt * price
    
    udat[user]["stonk"][handle] -= amt
    if udat[user]["stonk"][handle] == 0:
        del udat[user]["stonk"][handle]

    with open("data.json", "w") as f:
        json.dump(udat, f)

    return "1"

if __name__ == "__main__":
    app.run()
