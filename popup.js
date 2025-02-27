document.getElementById("compare").addEventListener("click", () => {
    let code1 = document.getElementById("code1").innerText.trim();
    let code2 = document.getElementById("code2").innerText.trim();

    if (code1 === "" || code2 === "") {
        alert("Please paste both code snippets!");
        return;
    }

    highlightDifferences(code1, code2, "code1");
    highlightDifferences(code2, code1, "code2");
});

// Function to highlight differences directly inside the content-editable div
function highlightDifferences(baseText, compareText, targetId) {
    let dmp = new diff_match_patch();
    let diffs = dmp.diff_main(baseText, compareText);
    dmp.diff_cleanupSemantic(diffs);

    let highlightedHTML = "";

    for (let i = 0; i < diffs.length; i++) {
        let type = diffs[i][0];
        let text = diffs[i][1];

        if (type === 1) { 
            highlightedHTML += `<span class="added">${text}</span>`; // Added (Green)
        } else if (type === -1) { 
            highlightedHTML += `<span class="removed">${text}</span>`; // Removed (Red)
        } else { 
            highlightedHTML += text;
        }
    }

    document.getElementById(targetId).innerHTML = highlightedHTML;
}

// Function to update line numbers dynamically
function updateLineNumbers(textarea, lineNumbersDiv) {
    let lines = textarea.innerText.split("\n").length;
    let lineNumbers = "";
    for (let i = 1; i <= lines; i++) {
        lineNumbers += i + "\n";
    }
    lineNumbersDiv.textContent = lineNumbers;
}

// Attach event listeners to both textareas
document.getElementById("code1").addEventListener("input", function() {
    updateLineNumbers(this, document.getElementById("lineNumbers1"));
});
document.getElementById("code2").addEventListener("input", function() {
    updateLineNumbers(this, document.getElementById("lineNumbers2"));
});

// Reset button functionality
document.getElementById("reset").addEventListener("click", () => {
    document.getElementById("code1").innerHTML = "";
    document.getElementById("code2").innerHTML = "";
    document.getElementById("lineNumbers1").textContent = "1";
    document.getElementById("lineNumbers2").textContent = "1";
});

// Dark mode toggle
const darkModeToggle = document.getElementById("darkModeToggle");

// Load saved mode
if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    darkModeToggle.textContent = "☀️";
} else {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "🌙";
}

// Toggle dark/light mode
darkModeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark-mode")) {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        darkModeToggle.textContent = "☀️";
        localStorage.setItem("theme", "light");
    } else {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        darkModeToggle.textContent = "🌙";
        localStorage.setItem("theme", "dark");
    }
});
