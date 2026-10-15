var form = document.querySelector("form");

form.onsubmit = function () {
    var answer = document.getElementById("answer");
    var whoPregnant = document.getElementById("pregnant").checked;
    var whoFamily = document.getElementById("family").checked;
    var wantAppointments = document.getElementById("appointments").checked;
    var wantSigns = document.getElementById("signs").checked;
    var wantPack = document.getElementById("pack").checked;
    var question = document.getElementById("question").value;

    if (!wantAppointments && !wantSigns && !wantPack && question.trim() == "") {
        answer.innerHTML = "<p>Please choose at least one topic, or type a question.</p>";
        answer.style.display = "block";
        return false;
    }

    var text = "";

    if (whoFamily) {
        text = text + "<p>You can use this to help the person who is pregnant.</p>";
    } else if (whoPregnant) {
        text = text + "<p>This is for you.</p>";
    }

    if (wantAppointments) {
        text = text + "<p><b>Who to see and where to go.</b> In the UK you usually see a midwife. If you do not know how to book, ask a GP. You can ask for an interpreter. A partner or family member can come too, if you want them there.</p>";
    }

    if (wantSigns) {
        text = text + "<p><b>Signs that mean you should get help.</b> Call for help if there is bleeding, the baby is moving less, a bad headache, or the waters break. Do not wait. If it feels like an emergency, call 999.</p>";
    }

    if (wantPack) {
        text = text + "<p><b>What to pack for the birth.</b> Pack notes from your appointments, any medicine, comfortable clothes, a phone charger, snacks, and the number of the person you will call.</p>";
    }

    if (question.trim() != "") {
        var safeQuestion = question.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        text = text + "<p>You asked: " + safeQuestion + "</p>";
        text = text + "<p>We will add an answer to questions like this later.</p>";
    }

    answer.innerHTML = text;
    answer.style.display = "block";
    return false;
};
