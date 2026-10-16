$(document).ready(function () {

    function showBox($el, useSlide) {
        $el.removeAttr("hidden");
        $el.attr("aria-hidden", "false");

        if (useSlide == true) {
            $el.stop(true, true).slideDown();
        } else {
            $el.stop(true, true).fadeIn();
        }
    }

    function hideBox($el, useSlide) {
        $el.attr("aria-hidden", "true");

        if (useSlide == true) {
            $el.stop(true, true).slideUp(function () {
                $el.attr("hidden", "hidden");
            });
        } else {
            $el.stop(true, true).hide();
            $el.attr("hidden", "hidden");
        }
    }

    function updateGreeting() {
        var who = $("input[name='who']:checked").val();

        if (who == "family") {
            $("#greeting").html("You can use this to help the person who is pregnant.");
            showBox($("#greeting"), false);
        } else if (who == "pregnant") {
            $("#greeting").html("This is for you.");
            showBox($("#greeting"), false);
        } else {
            $("#greeting").html("");
            hideBox($("#greeting"), false);
        }
    }

    function showHideSections() {
        if ($("#appointments").is(":checked")) {
            showBox($("#section-appointments"), true);
        } else {
            hideBox($("#section-appointments"), true);
        }

        if ($("#signs").is(":checked")) {
            showBox($("#section-signs"), true);
        } else {
            hideBox($("#section-signs"), true);
        }

        if ($("#pack").is(":checked")) {
            showBox($("#section-pack"), true);
        } else {
            hideBox($("#section-pack"), true);
        }
    }

    function safeText(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function getQuestionWord() {
        var text = $("#question").val().trim().toLowerCase();

        if (text == "") {
            return "";
        }

        var words = text.split(" ");
        var word = words[0];

        for (var i = 0; i < words.length; i++) {
            if (words[i].length > 3) {
                word = words[i];
                break;
            }
        }

        return word;
    }

    function getChosenTopics() {
        var topics = [];

        if ($("#appointments").is(":checked")) {
            topics.push("who to see and where to go");
        }
        if ($("#signs").is(":checked")) {
            topics.push("urgent warning signs");
        }
        if ($("#pack").is(":checked")) {
            topics.push("what to pack");
        }

        return topics;
    }

    // Shared checks for Show me and the calm-message button
    function getFormError() {
        var who = $("input[name='who']:checked").val();
        var language = $("#language").val();
        var quoteTheme = $("#quoteTheme").val();
        var questionText = $("#question").val();
        var topics = getChosenTopics();

        if (who == undefined || who == "") {
            return "Please choose who this is for.";
        }

        if (language == "") {
            return "Please choose your preferred language.";
        }

        if (topics.length == 0) {
            return "Please choose at least one topic to learn.";
        }

        if (quoteTheme == "") {
            return "Please choose a calm quote theme.";
        }

        if (questionText.trim() == "") {
            return "Please type a word or short question. It is used to search quotes.";
        }

        return "";
    }

    function showFormError(message) {
        hideBox($("#section-appointments"), true);
        hideBox($("#section-signs"), true);
        hideBox($("#section-pack"), true);
        $("#answer").html("<p class='mb-0'>" + safeText(message) + "</p>");
        showBox($("#answer"), false);
    }

    function showQuote(quote, theme, questionWord, matchedOn) {
        var html = "";

        html = html + "<p>" + safeText(quote.content) + "</p>";
        html = html + "<p><i>— " + safeText(quote.author) + "</i></p>";
        html = html + "<p><small>Form theme sent to quotes API: <b>" + safeText(theme) + "</b></small></p>";
        html = html + "<p><small>Form word sent to quotes API: <b>" + safeText(questionWord) + "</b></small></p>";

        if (matchedOn == "theme") {
            html = html + "<p><small>Matched your theme.</small></p>";
        } else if (matchedOn == "question") {
            html = html + "<p><small>No theme match, so matched your question word.</small></p>";
        } else {
            html = html + "<p><small>No exact match for theme or word, so here is another calm message.</small></p>";
        }

        html = html + "<p><small>Read this slowly while you breathe out.</small></p>";

        $("#quoteBoxBody").html(html);
        showBox($("#quoteBox"), false);
    }

    function loadQuoteFromForm() {
        var theme = $("#quoteTheme").val().toLowerCase();
        var questionWord = getQuestionWord();

        $("#quoteBoxBody").html(
            "<p>Loading a quote using your form theme <b>" + safeText(theme) +
            "</b> and word <b>" + safeText(questionWord) + "</b>...</p>"
        );
        showBox($("#quoteBox"), false);

        // Form values are used in the request (query) and to pick a matching quote
        $.getJSON("https://api.freeapi.app/api/v1/public/quotes?limit=50&query=" + encodeURIComponent(theme))
            .done(function (result) {
                var list = result.data.data;
                var themeMatches = [];
                var questionMatches = [];
                var i;

                for (i = 0; i < list.length; i++) {
                    var content = list[i].content.toLowerCase();

                    if (content.indexOf(theme) !== -1) {
                        themeMatches.push(list[i]);
                    }
                    if (content.indexOf(questionWord) !== -1) {
                        questionMatches.push(list[i]);
                    }
                }

                var quote;
                var matchedOn;

                if (themeMatches.length > 0) {
                    quote = themeMatches[Math.floor(Math.random() * themeMatches.length)];
                    matchedOn = "theme";
                } else if (questionMatches.length > 0) {
                    quote = questionMatches[Math.floor(Math.random() * questionMatches.length)];
                    matchedOn = "question";
                } else {
                    quote = list[Math.floor(Math.random() * list.length)];
                    matchedOn = "none";
                }

                showQuote(quote, theme, questionWord, matchedOn);
            })
            .fail(function () {
                $("#quoteBoxBody").html("<p>Sorry, the quote could not load. Please try again.</p>");
                showBox($("#quoteBox"), false);
            });
    }

    function loadDogFromApi() {
        var language = $("#language").val();
        var topics = getChosenTopics();
        var topicText = topics.join(", ");

        $("#dogBoxBody").html(
            "<p>Loading a soft picture for language <b>" + safeText(language) +
            "</b> and topics: <b>" + safeText(topicText) + "</b>...</p>"
        );
        showBox($("#dogBox"), false);

        // Language from the form is sent in the request URL as a simple label/seed
        $.getJSON("https://api.freeapi.app/api/v1/public/dogs/dog/random?lang=" + encodeURIComponent(language))
            .done(function (result) {
                var dog = result.data;
                var imageUrl = dog.image.url;
                var dogName = dog.name;
                var temperament = dog.temperament;

                $("#dogBoxBody").html(
                    "<p>Look at this picture for a few slow breaths.</p>" +
                    "<p><img src='" + imageUrl + "' alt='A photo of a " + safeText(dogName) + "'></p>" +
                    "<p><b>" + safeText(dogName) + "</b></p>" +
                    "<p><small>" + safeText(temperament) + "</small></p>" +
                    "<p><small>Chosen using your form language: <b>" + safeText(language) + "</b></small></p>" +
                    "<p><small>Linked to your form topics: <b>" + safeText(topicText) + "</b></small></p>"
                );
                showBox($("#dogBox"), false);
            })
            .fail(function () {
                $("#dogBoxBody").html("<p>Sorry, the picture could not load. Please try again.</p>");
                showBox($("#dogBox"), false);
            });
    }

    function loadApisFromForm() {
        loadQuoteFromForm();
        loadDogFromApi();
    }

    function showAnswer() {
        $("#answer").empty();
        hideBox($("#answer"), false);

        var error = getFormError();

        if (error != "") {
            showFormError(error);
            return;
        }

        showHideSections();

        var language = $("#language").val();
        var quoteTheme = $("#quoteTheme").val();
        var questionText = $("#question").val();
        var topics = getChosenTopics();
        var languageNote = "";

        if (language != "English") {
            languageNote = "<p>You chose <b>" + safeText(language) + "</b>. You can ask for an interpreter at your midwife or GP appointment.</p>";
        } else {
            languageNote = "<p>Preferred language: <b>" + safeText(language) + "</b>.</p>";
        }

        $("#answer").html(
            languageNote +
            "<p>Topics from your form: <b>" + safeText(topics.join(", ")) + "</b></p>" +
            "<p>Quote theme from your form: <b>" + safeText(quoteTheme) + "</b></p>" +
            "<p>You asked: " + safeText(questionText) + "</p>" +
            "<p>Loading FreeAPI results below using those form answers...</p>"
        );
        showBox($("#answer"), false);

        loadApisFromForm();
    }

    function clearAll() {
        $("#needForm")[0].reset();
        hideBox($("#section-appointments"), true);
        hideBox($("#section-signs"), true);
        hideBox($("#section-pack"), true);
        $("#answer").empty();
        hideBox($("#answer"), false);
        $("#quoteBoxBody").empty();
        hideBox($("#quoteBox"), false);
        $("#dogBoxBody").empty();
        hideBox($("#dogBox"), false);
        $("#greeting").html("");
        hideBox($("#greeting"), false);
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
        var error = getFormError();

        if (error != "") {
            showFormError(error);
            return;
        }

        loadApisFromForm();
    });

});
