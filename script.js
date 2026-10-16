$(document).ready(function () {

    function updateGreeting() {
        var who = $("input[name='who']:checked").val();

        if (who == "family") {
            $("#greeting").html("You can use this to help the person who is pregnant.").fadeIn();
        } else if (who == "pregnant") {
            $("#greeting").html("This is for you.").fadeIn();
        } else {
            $("#greeting").html("").hide();
        }
    }

    function showHideSections() {
        if ($("#appointments").is(":checked")) {
            $("#section-appointments").slideDown();
        } else {
            $("#section-appointments").slideUp();
        }

        if ($("#signs").is(":checked")) {
            $("#section-signs").slideDown();
        } else {
            $("#section-signs").slideUp();
        }

        if ($("#pack").is(":checked")) {
            $("#section-pack").slideDown();
        } else {
            $("#section-pack").slideUp();
        }
    }

    function showAnswer() {
        $("#answer").empty().hide();

        var wantAppointments = $("#appointments").is(":checked");
        var wantSigns = $("#signs").is(":checked");
        var wantPack = $("#pack").is(":checked");
        var questionText = $("#question").val();

        if (wantAppointments == false && wantSigns == false && wantPack == false && questionText.trim() == "") {
            $("#section-appointments").slideUp();
            $("#section-signs").slideUp();
            $("#section-pack").slideUp();
            $("#answer").html("<p>Please choose at least one topic, or type a question.</p>").fadeIn();
            return;
        }

        showHideSections();

        if (questionText.trim() != "") {
            var safeQuestion = questionText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            $("#answer").html(
                "<p>You asked: " + safeQuestion + "</p>" +
                "<p>We will add an answer to questions like this later.</p>"
            ).fadeIn();
        } else {
            $("#answer").hide();
        }
    }

    function clearAll() {
        $("#needForm")[0].reset();
        $("#section-appointments").slideUp();
        $("#section-signs").slideUp();
        $("#section-pack").slideUp();
        $("#answer").empty().hide();
        $("#quoteBox").empty().hide();
        $("#greeting").html("").hide();
    }

    $("input[name='who']").click(function () {
        updateGreeting();
    });

    $("#needForm").submit(function () {
        showAnswer();
        return false;
    });

    $("#clearBtn").click(function () {
        clearAll();
    });

    $("#quoteBtn").click(function () {
        $("#quoteBox").html("<p>Loading a message...</p>").fadeIn();

        $.getJSON("https://api.freeapi.app/api/v1/public/quotes?limit=10")
            .done(function (result) {
                var list = result.data.data;
                var index = Math.floor(Math.random() * list.length);
                var quote = list[index];

                $("#quoteBox").html(
                    "<p>" + quote.content + "</p>" +
                    "<p><i>— " + quote.author + "</i></p>" +
                    "<p><small>Read this slowly while you breathe out.</small></p>"
                ).fadeIn();
            })
            .fail(function () {
                $("#quoteBox").html("<p>Sorry, the message could not load. Please try again.</p>").fadeIn();
            });
    });

});
