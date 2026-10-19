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

        if (language == "") {
            return "Please choose your preferred language.";
        }

        if (who == undefined || who == "") {
            return "Please choose who this is for.";
        }

        if (topics.length == 0) {
            return "Please choose at least one topic to learn.";
        }

        return "";
    }

    // Calming focus controls quotes and dog pictures only (not the learning form)
    function getThemeError() {
        if ($("#quoteTheme").val() == "") {
            return "Please choose a calming focus.";
        }

        return "";
    }

    function showFormError(message) {
        hideBox($("#section-appointments"), true);
        hideBox($("#section-signs"), true);
        hideBox($("#section-pack"), true);
        $("#answer").html("<p>" + safeText(message) + "</p>");
        showBox($("#answer"), false);
    }

    function showCalmError(message) {
        $("#quoteBoxBody").html("<p>" + safeText(message) + "</p>");
        showBox($("#quoteBox"), false);
        hideBox($("#dogBox"), false);
    }

    var lastQuoteText = "";
    var lastDogUrl = "";
    var dogRetryCount = 0;
    var quoteRetryCount = 0;

    function showQuote(text, author) {
        var html = "";

        html = html + "<p><small>Read this slowly while you breathe out.</small></p>";
        html = html + "<p>" + safeText(text) + "</p>";

        if (author != "") {
            html = html + "<p><i>— " + safeText(author) + "</i></p>";
        }

        $("#quoteBoxBody").html(html);
        showBox($("#quoteBox"), false);
    }

    // Free coping-style quotes (mindfulness / peace / resilience).
    // Quoteverse healing/mindfulness was the goal, but its public host is not
    // reliably online, so this uses Loving Universe which has those themes.
    function getCopingQuoteUrl(focus, refreshId) {
        if (focus == "peace" || focus == "resilience") {
            return "https://api.loving-universe.com/random?tag=" + encodeURIComponent(focus) + "&_=" + refreshId;
        }

        // healing and mindfulness both use the mindfulness category
        return "https://api.loving-universe.com/random?category=mindfulness&_=" + refreshId;
    }

    function loadQuoteFromForm() {
        var focus = $("#quoteTheme").val().toLowerCase();
        var refreshId = new Date().getTime();

        $("#quoteBoxBody").html(
            "<p>Loading a calming message for <b>" + safeText(focus) + "</b>...</p>"
        );
        showBox($("#quoteBox"), false);

        $.ajax({
            url: getCopingQuoteUrl(focus, refreshId),
            method: "GET",
            dataType: "json",
            cache: false,
            headers: {
                Accept: "application/json"
            }
        })
            .done(function (result) {
                var text = result.text;
                var author = "";

                if (result.author && result.author.name) {
                    author = result.author.name;
                }

                // Try once more if we got the same message again
                if (text == lastQuoteText && quoteRetryCount < 3) {
                    quoteRetryCount = quoteRetryCount + 1;
                    loadQuoteFromForm();
                    return;
                }

                quoteRetryCount = 0;
                lastQuoteText = text;
                showQuote(text, author);
            })
            .fail(function () {
                $("#quoteBoxBody").html("<p>Sorry, the calming message could not load. Please try again.</p>");
                showBox($("#quoteBox"), false);
            });
    }

    function loadDogFromApi() {
        var theme = $("#quoteTheme").val().toLowerCase();
        var refreshId = new Date().getTime();

        $("#dogBoxBody").html(
            "<p>Loading a soft picture for <b>" + safeText(theme) + "</b>...</p>"
        );
        showBox($("#dogBox"), false);

        // Theme from the calm section is sent in the request. refreshId asks for a new reply each click.
        $.ajax({
            url: "https://api.freeapi.app/api/v1/public/dogs/dog/random?theme=" + encodeURIComponent(theme) + "&_=" + refreshId,
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
                    "<p><small>" + safeText(temperament) + "</small></p>"
                );
                showBox($("#dogBox"), false);
            })
            .fail(function () {
                $("#dogBoxBody").html("<p>Sorry, the picture could not load. Please try again.</p>");
                showBox($("#dogBox"), false);
            });
    }

    function loadCalmApis() {
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

        // Form only shows the learning topic answers
        showHideSections();
    }

    function clearAll() {
        $("#needForm")[0].reset();
        hideBox($("#section-appointments"), true);
        hideBox($("#section-signs"), true);
        hideBox($("#section-pack"), true);
        $("#answer").empty();
        hideBox($("#answer"), false);
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

    $("#aboutReadMore").click(function () {
        if ($("#about-more").attr("hidden")) {
            showBox($("#about-more"), false);
            $("#aboutReadMore").text("Read less");
        } else {
            hideBox($("#about-more"), false);
            $("#aboutReadMore").text("Read more");
        }
    });

    $("#learnReadMore").click(function () {
        if ($("#learn-more").attr("hidden")) {
            showBox($("#learn-more"), false);
            $("#learnReadMore").text("Read less");
        } else {
            hideBox($("#learn-more"), false);
            $("#learnReadMore").text("Read more");
        }
    });

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
        var error = getThemeError();

        if (error != "") {
            showCalmError(error);
            return;
        }

        loadCalmApis();
    });

    $("#newQuoteBtn").click(function () {
        var error = getThemeError();

        if (error != "") {
            showCalmError(error);
            return;
        }

        loadQuoteFromForm();
    });

    $("#newDogBtn").click(function () {
        var error = getThemeError();

        if (error != "") {
            showCalmError(error);
            return;
        }

        loadDogFromApi();
    });

});

/*
References
Chaicode. (n.d.). FreeAPI docs: Public APIs. https://api.freeapi.app/#/%F0%9F%93%A2%20Public%20APIs
Loving Universe. (n.d.). Keyless quotes API & MCP server. https://www.loving-universe.com/developers
Refsnes Data. (n.d.). The HTML DOM. W3Schools. https://www.w3schools.com/js/js_htmldom.asp
Refsnes Data. (n.d.). JavaScript classes. W3Schools. https://www.w3schools.com/js/js_classes.asp
Refsnes Data. (n.d.). Web APIs - Introduction. W3Schools. https://www.w3schools.com/js/js_api_intro.asp
WebTutor. (2023, June 25). Mastering JavaScript: A beginner's guide to programming magic. https://webtutor.dev/blogs/js/mastering-in-javascript-for-beginner
WebTutor. (2023, June 25). Step up your coding game with jQuery: The essential guide for new developers. https://webtutor.dev/blogs/jquery/essential-jquery-guide-for-new-developers
*/