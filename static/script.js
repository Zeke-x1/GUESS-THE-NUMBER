document.addEventListener("DOMContentLoaded", function () {
    createParticles();
    startNewGame();

    document.getElementById("guessInput").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            submitGuess();
        }
    });
});

/* ---- Floating background particles ---- */
function createParticles() {
    const count = 25;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.classList.add("particle");
        const size = Math.random() * 80 + 20;
        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = (Math.random() * 18 + 12) + "s";
        p.style.animationDelay = (Math.random() * -30) + "s";
        document.body.appendChild(p);
    }
}

/* ---- Game logic ---- */
async function startNewGame() {
    try {
        const response = await fetch("/api/new-game", { method: "POST" });
        const data = await response.json();

        const messageEl = document.getElementById("message");
        messageEl.textContent = data.message;
        messageEl.className = "message animate-in";

        document.getElementById("attempts").textContent = "Attempts: 0";
        document.getElementById("historyList").innerHTML = "";
        document.getElementById("history").classList.remove("visible");
        document.getElementById("guessInput").value = "";
        document.getElementById("guessInput").disabled = false;
        document.getElementById("guessBtn").disabled = false;
        document.getElementById("guessInput").focus();

        document.querySelector(".container").classList.remove("win-flash");
    } catch (err) {
        showError("Could not start a new game. Please try again.");
    }
}

async function submitGuess() {
    const input = document.getElementById("guessInput");
    const value = input.value.trim();

    if (value === "") {
        showError("Please enter a number.");
        return;
    }

    const guess = parseInt(value, 10);

    if (isNaN(guess) || guess < 1 || guess > 100) {
        showError("Please enter a number between 1 and 100.");
        return;
    }

    try {
        const response = await fetch("/api/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guess: guess })
        });

        const data = await response.json();

        if (data.error) {
            showError(data.error);
            return;
        }

        const messageEl = document.getElementById("message");
        messageEl.textContent = data.message;

        // Pick the right animation per result
        if (data.won) {
            messageEl.className = "message correct celebrate";
            document.querySelector(".container").classList.add("win-flash");
            pulseInput("correct");
        } else {
            messageEl.className = "message " + data.result + " shake";
            pulseInput(data.result);
        }

        // Bump the attempt counter
        const statsEl = document.getElementById("attempts");
        statsEl.textContent = "Attempts: " + data.attempts;
        statsEl.parentElement.classList.remove("bump");
        void statsEl.parentElement.offsetWidth;          // force reflow
        statsEl.parentElement.classList.add("bump");

        addToHistory(guess, data.result);

        if (data.won) {
            document.getElementById("guessInput").disabled = true;
            document.getElementById("guessBtn").disabled = true;
        }

        input.value = "";
        if (!data.won) {
            input.focus();
        }
    } catch (err) {
        showError("Something went wrong. Please try again.");
    }
}

/* ---- Helpers ---- */
function pulseInput(result) {
    const input = document.getElementById("guessInput");
    input.classList.remove("input-pulse-low", "input-pulse-high", "input-pulse-correct");
    void input.offsetWidth;
    input.classList.add("input-pulse-" + result);
}

function addToHistory(guess, result) {
    const list = document.getElementById("historyList");
    const li = document.createElement("li");
    li.textContent = guess;
    li.className = result;
    list.appendChild(li);
    document.getElementById("history").classList.add("visible");
}

function showError(text) {
    const messageEl = document.getElementById("message");
    messageEl.textContent = text;
    messageEl.className = "message error shake";
}
