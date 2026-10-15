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
    } else if (pregnant.checked == true) {
        greeting.innerHTML = "This is for you.";
    } else {
        greeting.innerHTML = "Choose who this is for below, and the greeting will change.";
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
        addParagraph(answer, "Please choose at least one topic, or type a question.");
        answer.style.display = "block";
        return;
    }

    var title = document.createElement("h3");
    title.innerHTML = "Your answers";
    answer.appendChild(title);

    if (family.checked == true) {
        addParagraph(answer, "You can use this to help the person who is pregnant.");
    } else if (pregnant.checked == true) {
        addParagraph(answer, "This is for you.");
    }

    if (wantAppointments == true) {
        addParagraph(answer, "<b>Who to see and where to go.</b> In the UK you usually see a midwife. If you do not know how to book, ask a GP. You can ask for an interpreter.");
    }

    if (wantSigns == true) {
        var urgent = document.createElement("div");
        urgent.className = "urgent-box";
        addParagraph(urgent, "<b>Signs that mean you should get help.</b> Call for help if there is bleeding, the baby is moving less, a bad headache, or the waters break. Do not wait. If it feels like an emergency, call 999.");
        answer.appendChild(urgent);
    }

    if (wantPack == true) {
        addParagraph(answer, "<b>What to pack for the birth.</b> Pack notes from your appointments, any medicine, comfortable clothes, a phone charger, snacks, and the number of the person you will call.");
    }

    if (questionText.trim() != "") {
        var safeQuestion = questionText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        addParagraph(answer, "You asked: " + safeQuestion);
        addParagraph(answer, "We will add an answer to questions like this later.");
    }

    answer.style.display = "block";
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

    greeting.innerHTML = "Choose who this is for below, and the greeting will change.";
}

pregnant.onclick = function () {
    updateGreeting();
};

family.onclick = function () {
    updateGreeting();
};

appointments.onclick = function () {
    showHideSections();
};

signs.onclick = function () {
    showHideSections();
};

pack.onclick = function () {
    showHideSections();
};

form.onsubmit = function () {
    showAnswer();
    return false;
};

clearBtn.onclick = function () {
    clearAll();
};
