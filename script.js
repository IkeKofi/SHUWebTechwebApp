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

    function wordFromTopics() {
        if ($("#signs").is(":checked")) {
            return "life";
        }
        if ($("#appointments").is(":checked")) {
            return "hope";
        }
        if ($("#pack").is(":checked")) {
            return "home";
        }
        return "";
    }

    function getSearchWord() {
        var text = $("#question").val().trim().toLowerCase();

        if (text != "") {
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

        var theme = $("#quoteTheme").val();
        if (theme != "") {
            return theme;
        }

        return wordFromTopics();
    }

    function showQuote(quote, searchWord, exactMatch) {
        var html = "";
        var safeWord = safeText(searchWord);

        html = html + "<p>" + safeText(quote.content) + "</p>";
        html = html + "<p><i>— " + safeText(quote.author) + "</i></p>";

        if (exactMatch == true) {
            html = html + "<p><small>Quote search word from your form: <b>" + safeWord + "</b></small></p>";
        } else {
            html = html + "<p><small>No quote matched <b>" + safeWord + "</b>, so here is another calm message.</small></p>";
        }

        html = html + "<p class='mb-0'><small>Read this slowly while you breathe out.</small></p>";

        $("#quoteBoxBody").html(html);
        showBox($("#quoteBox"), false);
    }

    function loadQuoteFromForm() {
        var searchWord = getSearchWord();

        if (searchWord == "") {
            $("#quoteBoxBody").html("<p class='mb-0'>Please choose a quote theme or type a word in the form first.</p>");
            showBox($("#quoteBox"), false);
            return;
        }

        $("#quoteBoxBody").html("<p class='mb-0'>Loading a quote for: <b>" + safeText(searchWord) + "</b>...</p>");
        showBox($("#quoteBox"), false);

        $.getJSON("https://api.freeapi.app/api/v1/public/quotes?limit=50")
            .done(function (result) {
                var list = result.data.data;
                var matches = [];

                for (var i = 0; i < list.length; i++) {
                    if (list[i].content.toLowerCase().indexOf(searchWord) !== -1) {
                        matches.push(list[i]);
                    }
                }

                var quote;
                var exactMatch;

                if (matches.length > 0) {
                    quote = matches[Math.floor(Math.random() * matches.length)];
                    exactMatch = true;
                } else {
                    quote = list[Math.floor(Math.random() * list.length)];
                    exactMatch = false;
                }

                showQuote(quote, searchWord, exactMatch);
            })
            .fail(function () {
                $("#quoteBoxBody").html("<p class='mb-0'>Sorry, the quote could not load. Please try again.</p>");
                showBox($("#quoteBox"), false);
            });
    }

    function loadDogFromApi() {
        $("#dogBoxBody").html("<p class='mb-0'>Loading a soft picture...</p>");
        showBox($("#dogBox"), false);

        $.getJSON("https://api.freeapi.app/api/v1/public/dogs/dog/random")
            .done(function (result) {
                var dog = result.data;
                var imageUrl = dog.image.url;
                var dogName = dog.name;
                var temperament = dog.temperament;

                $("#dogBoxBody").html(
                    "<p>Look at this picture for a few slow breaths.</p>" +
                    "<p><img src='" + imageUrl + "' alt='A photo of a " + safeText(dogName) + "'></p>" +
                    "<p><b>" + safeText(dogName) + "</b></p>" +
                    "<p class='mb-0'><small>" + safeText(temperament) + "</small></p>"
                );
                showBox($("#dogBox"), false);
            })
            .fail(function () {
                $("#dogBoxBody").html("<p class='mb-0'>Sorry, the picture could not load. Please try again.</p>");
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

        var who = $("input[name='who']:checked").val();
        var language = $("#language").val();
        var quoteTheme = $("#quoteTheme").val();
        var wantAppointments = $("#appointments").is(":checked");
        var wantSigns = $("#signs").is(":checked");
        var wantPack = $("#pack").is(":checked");
        var questionText = $("#question").val();

        if (who == undefined || who == "") {
            hideBox($("#section-appointments"), true);
            hideBox($("#section-signs"), true);
            hideBox($("#section-pack"), true);
            $("#answer").html("<p class='mb-0'>Please choose who this is for.</p>");
            showBox($("#answer"), false);
            return;
        }

        if (language == "") {
            $("#answer").html("<p class='mb-0'>Please choose your preferred language.</p>");
            showBox($("#answer"), false);
            return;
        }

        if (wantAppointments == false && wantSigns == false && wantPack == false) {
            hideBox($("#section-appointments"), true);
            hideBox($("#section-signs"), true);
            hideBox($("#section-pack"), true);
            $("#answer").html("<p class='mb-0'>Please choose at least one topic to learn.</p>");
            showBox($("#answer"), false);
            return;
        }

        if (quoteTheme == "") {
            $("#answer").html("<p class='mb-0'>Please choose a calm quote theme.</p>");
            showBox($("#answer"), false);
            return;
        }

        if (questionText.trim() == "") {
            $("#answer").html("<p class='mb-0'>Please type a word or short question. It is used to search quotes.</p>");
            showBox($("#answer"), false);
            return;
        }

        showHideSections();

        var safeQuestion = safeText(questionText);
        var safeLanguage = safeText(language);
        var safeTheme = safeText(quoteTheme);
        var languageNote = "";

        if (language != "English") {
            languageNote = "<p>You chose <b>" + safeLanguage + "</b>. You can ask for an interpreter at your midwife or GP appointment.</p>";
        } else {
            languageNote = "<p>Preferred language: <b>" + safeLanguage + "</b>.</p>";
        }

        $("#answer").html(
            languageNote +
            "<p>Quote theme from your form: <b>" + safeTheme + "</b></p>" +
            "<p>You asked: " + safeQuestion + "</p>" +
            "<p class='mb-0'>Loading a FreeAPI quote and a soft dog picture below...</p>"
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
        loadApisFromForm();
    });

});
