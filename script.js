var form = document.getElementById("needForm");
var greeting = document.getElementById("greeting");
var answer = document.getElementById("answer");
var clearBtn = document.getElementById("clearBtn");

var pregnant = document.getElementById("pregnant");
var family = document.getElementById("family");
var appointments = document.getElementById("appointments");
var signs = document.getElementById("signs");
var pack = document.getElementById("pack");
var question = document.getElementById("question");

var sectionAppointments = document.getElementById("section-appointments");
var sectionSigns = document.getElementById("section-signs");
var sectionPack = document.getElementById("section-pack");

function updateGreeting() {
    if (family.checked == true) {
        greeting.innerHTML = "You can use this to help the person who is pregnant.";
        greeting.style.display = "block";
    } else if (pregnant.checked == true) {
        greeting.innerHTML = "This is for you.";
        greeting.style.display = "block";
    } else {
        greeting.innerHTML = "";
        greeting.style.display = "none";
    }
}

function showHideSections() {
    if (appointments.checked == true) {
        sectionAppointments.style.display = "block";
    } else {
        sectionAppointments.style.display = "none";
    }

    if (signs.checked == true) {
        sectionSigns.style.display = "block";
    } else {
        sectionSigns.style.display = "none";
    }

    if (pack.checked == true) {
        sectionPack.style.display = "block";
    } else {
        sectionPack.style.display = "none";
    }
}

function addParagraph(parent, text) {
    var p = document.createElement("p");
    p.innerHTML = text;
    parent.appendChild(p);
}

function showAnswer() {
    while (answer.firstChild) {
        answer.removeChild(answer.firstChild);
    }

    var wantAppointments = appointments.checked;
    var wantSigns = signs.checked;
    var wantPack = pack.checked;
    var questionText = question.value;

    if (wantAppointments == false && wantSigns == false && wantPack == false && questionText.trim() == "") {
        sectionAppointments.style.display = "none";
        sectionSigns.style.display = "none";
        sectionPack.style.display = "none";
        addParagraph(answer, "Please choose at least one topic, or type a question.");
        answer.style.display = "block";
        return;
    }

    showHideSections();

    if (questionText.trim() != "") {
        var safeQuestion = questionText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        addParagraph(answer, "You asked: " + safeQuestion);
        addParagraph(answer, "We will add an answer to questions like this later.");
        answer.style.display = "block";
    } else {
        answer.style.display = "none";
    }
}

function clearAll() {
    pregnant.checked = false;
    family.checked = false;
    appointments.checked = false;
    signs.checked = false;
    pack.checked = false;
    question.value = "";

    sectionAppointments.style.display = "none";
    sectionSigns.style.display = "none";
    sectionPack.style.display = "none";

    while (answer.firstChild) {
        answer.removeChild(answer.firstChild);
    }
    answer.style.display = "none";

    greeting.innerHTML = "";
    greeting.style.display = "none";
}

pregnant.onclick = function () {
    updateGreeting();
};

family.onclick = function () {
    updateGreeting();
};

form.onsubmit = function () {
    showAnswer();
    return false;
};

clearBtn.onclick = function () {
    clearAll();
};

var quoteBtn = document.getElementById("quoteBtn");
var quoteBox = document.getElementById("quoteBox");

quoteBtn.onclick = function () {
    quoteBox.style.display = "block";
    quoteBox.innerHTML = "<p>Loading a message...</p>";

    fetch("https://api.freeapi.app/api/v1/public/quotes?limit=10")
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            var list = result.data.data;
            var index = Math.floor(Math.random() * list.length);
            var quote = list[index];

            while (quoteBox.firstChild) {
                quoteBox.removeChild(quoteBox.firstChild);
            }

            var message = document.createElement("p");
            message.innerHTML = quote.content;
            quoteBox.appendChild(message);

            var author = document.createElement("p");
            author.innerHTML = "<i>— " + quote.author + "</i>";
            quoteBox.appendChild(author);

            var tip = document.createElement("p");
            tip.innerHTML = "<small>Read this slowly while you breathe out.</small>";
            quoteBox.appendChild(tip);
        })
        .catch(function () {
            quoteBox.innerHTML = "<p>Sorry, the message could not load. Please try again.</p>";
        });
};
