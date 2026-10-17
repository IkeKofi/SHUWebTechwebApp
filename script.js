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
                $el.css("display", "none");
            });
        } else {
            $el.stop(true, true).hide();
            $el.css({
                display: "none",
                opacity: ""
            });
            $el.attr("hidden", "hidden");
        }
    }

    function closeMidwifePanel() {
        hideBox($("#midwifeBox"), false);
        $("#midwifeConfirm").empty();
        hideBox($("#midwifeConfirm"), false);
        $("#midwifeForm").show();
        if ($("#midwifeForm")[0]) {
            $("#midwifeForm")[0].reset();
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

    // Checks for the main learning form (Show me)
    function getFormError() {
        var who = $("input[name='who']:checked").val();
        var language = $("#language").val();
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

        return "";
    }

    // Theme sits under the calming quotes section and is needed for quotes/API
    function getThemeError() {
        if ($("#quoteTheme").val() == "") {
            return "Please choose a calm quote theme.";
        }

        return "";
    }

    function getCalmMessageError() {
        var formError = getFormError();

        if (formError != "") {
            return formError;
        }

        return getThemeError();
    }

    function showFormError(message) {
        hideBox($("#section-appointments"), true);
        hideBox($("#section-signs"), true);
        hideBox($("#section-pack"), true);
        $("#answer").html("<p class='mb-0'>" + safeText(message) + "</p>");
        showBox($("#answer"), false);
    }

    var lastQuoteText = "";
    var lastDogUrl = "";
    var dogRetryCount = 0;

    function pickDifferentQuote(list) {
        var quote = list[Math.floor(Math.random() * list.length)];
        var tries = 0;

        // Try a few times so New message is less likely to repeat the same quote
        while (list.length > 1 && quote.content == lastQuoteText && tries < 8) {
            quote = list[Math.floor(Math.random() * list.length)];
            tries = tries + 1;
        }

        lastQuoteText = quote.content;
        return quote;
    }

    function showQuote(quote) {
        var html = "";

        html = html + "<p><small>Read this slowly while you breathe out.</small></p>";
        html = html + "<p>" + safeText(quote.content) + "</p>";
        html = html + "<p><i>— " + safeText(quote.author) + "</i></p>";

        $("#quoteBoxBody").html(html);
        showBox($("#quoteBox"), false);
    }

    function loadQuoteFromForm() {
        var theme = $("#quoteTheme").val().toLowerCase();
        var refreshId = new Date().getTime();

        $("#quoteBoxBody").html(
            "<p>Loading a quote using your form theme <b>" + safeText(theme) + "</b>...</p>"
        );
        showBox($("#quoteBox"), false);

        // Theme from the form is sent in the request. refreshId stops the browser caching the same reply.
        $.ajax({
            url: "https://api.freeapi.app/api/v1/public/quotes?limit=50&query=" + encodeURIComponent(theme) + "&_=" + refreshId,
            method: "GET",
            dataType: "json",
            cache: false
        })
            .done(function (result) {
                var list = result.data.data;
                var themeMatches = [];
                var i;

                for (i = 0; i < list.length; i++) {
                    if (list[i].content.toLowerCase().indexOf(theme) !== -1) {
                        themeMatches.push(list[i]);
                    }
                }

                var quote;

                if (themeMatches.length > 0) {
                    quote = pickDifferentQuote(themeMatches);
                } else {
                    quote = pickDifferentQuote(list);
                }

                showQuote(quote);
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
        var refreshId = new Date().getTime();

        $("#dogBoxBody").html(
            "<p>Loading a soft picture for language <b>" + safeText(language) +
            "</b> and topics: <b>" + safeText(topicText) + "</b>...</p>"
        );
        showBox($("#dogBox"), false);

        // Language from the form is sent in the request. refreshId asks for a new reply each click.
        $.ajax({
            url: "https://api.freeapi.app/api/v1/public/dogs/dog/random?lang=" + encodeURIComponent(language) + "&_=" + refreshId,
            method: "GET",
            dataType: "json",
            cache: false
        })
            .done(function (result) {
                var dog = result.data;
                var imageUrl = dog.image.url;
                var dogName = dog.name;
                var temperament = dog.temperament;

                // If the API sent the same picture again, ask once more (max 3 tries)
                if (imageUrl == lastDogUrl && dogRetryCount < 3) {
                    dogRetryCount = dogRetryCount + 1;
                    loadDogFromApi();
                    return;
                }

                dogRetryCount = 0;
                lastDogUrl = imageUrl;

                $("#dogBoxBody").html(
                    "<p>Look at this picture for a few slow breaths.</p>" +
                    "<p><img src='" + imageUrl + "?_=" + refreshId + "' alt='A photo of a " + safeText(dogName) + "'></p>" +
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

        // Load calm quote and picture if a theme was chosen
        if ($("#quoteTheme").val() != "") {
            loadApisFromForm();
        }
    }

    function clearAll() {
        $("#needForm")[0].reset();
        $("#quoteTheme").val("");
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
        hideBox($("#midwifeBox"), false);
        $("#midwifeConfirm").empty();
        hideBox($("#midwifeConfirm"), false);
        $("#midwifeForm").show();
        if ($("#midwifeForm")[0]) {
            $("#midwifeForm")[0].reset();
        }
    }

    function setMidwifeDateMin() {
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth() + 1;
        var day = today.getDate();

        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }

        $("#midwifeDate").attr("min", year + "-" + month + "-" + day);
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

    $("#bookMidwifeBtn").click(function () {
        setMidwifeDateMin();
        $("#midwifeForm").show();
        $("#midwifeConfirm").empty();
        hideBox($("#midwifeConfirm"), false);
        showBox($("#midwifeBox"), false);
    });

    $("#closeMidwifeBtn").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeMidwifePanel();
        return false;
    });

    $("#midwifeForm").submit(function () {
        var name = $("#midwifeName").val().trim();
        var date = $("#midwifeDate").val();
        var time = $("#midwifeTime").val();

        if (name == "" || date == "" || time == "") {
            $("#midwifeConfirm").html("<p>Please fill in your name, date and time.</p>");
            showBox($("#midwifeConfirm"), false);
            return false;
        }

        $("#midwifeForm").hide();
        $("#midwifeConfirm").html(
            "<p><b>Booking requested</b></p>" +
            "<p>Name: " + safeText(name) + "</p>" +
            "<p>Date: " + safeText(date) + "</p>" +
            "<p>Time: " + safeText(time) + "</p>" +
            "<p>In real life you would also call your GP or maternity unit to confirm.</p>"
        );
        showBox($("#midwifeConfirm"), false);
        return false;
    });

    $("#quoteBtn").click(function () {
        var error = getCalmMessageError();

        if (error != "") {
            showFormError(error);
            return;
        }

        loadApisFromForm();
    });

    $("#newQuoteBtn").click(function () {
        var error = getCalmMessageError();

        if (error != "") {
            showFormError(error);
            return;
        }

        loadQuoteFromForm();
    });

    $("#newDogBtn").click(function () {
        var error = getCalmMessageError();

        if (error != "") {
            showFormError(error);
            return;
        }

        loadDogFromApi();
    });

});
