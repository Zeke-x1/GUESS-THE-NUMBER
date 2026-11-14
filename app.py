from flask import Flask, render_template, request, jsonify, session
import random
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/new-game", methods=["POST"])
def new_game():
    session["target"] = random.randint(1, 100)
    session["attempts"] = 0
    return jsonify({"message": "A new number has been chosen between 1 and 100. Start guessing!"})


@app.route("/api/guess", methods=["POST"])
def guess():
    if "target" not in session:
        return jsonify({"error": "No active game. Start a new game first."}), 400

    data = request.get_json()
    if not data or "guess" not in data:
        return jsonify({"error": "Please provide a guess."}), 400

    try:
        player_guess = int(data["guess"])
    except (ValueError, TypeError):
        return jsonify({"error": "Please enter a valid number."}), 400

    if player_guess < 1 or player_guess > 100:
        return jsonify({"error": "Your guess must be between 1 and 100."}), 400

    session["attempts"] = session.get("attempts", 0) + 1
    target = session["target"]
    attempts = session["attempts"]

    if player_guess < target:
        return jsonify({
            "result": "low",
            "message": "Too low! Try a higher number.",
            "attempts": attempts,
            "won": False
        })
    elif player_guess > target:
        return jsonify({
            "result": "high",
            "message": "Too high! Try a lower number.",
            "attempts": attempts,
            "won": False
        })
    else:
        return jsonify({
            "result": "correct",
            "message": f"Correct! You found the number in {attempts} attempt{'s' if attempts != 1 else ''}.",
            "attempts": attempts,
            "won": True
        })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
