// welcome Navigation
document.addEventListener("DOMContentLoaded", function () {

    // goes to welcome page by clicking the logo
    document.getElementById("logo").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "../html/welcome.html";
    });

    // goes to signin by clicking get started
    document.getElementById("get-started").addEventListener("click", function(event) {
        event.preventDefault();  
        window.location.href = "../html/signin.html";
    });

    // goes to signin
    document.getElementById("login").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "../html/signin.html";
    });

    // goes to signup
    document.getElementById("signup").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "../html/signup.html";
    });
});

// Homepage Navigation
document.addEventListener("DOMContentLoaded", function () {

    // goes to home-tab
    document.getElementById("home-tab").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "homepage.html";
    });

    // goes to quizzes-tab
    document.getElementById("quizzes-tab").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "sidebars/sd_quizzes.html";
    });

    // goes to inbox-tab
    document.getElementById("inbox-tab").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "sidebars/sd_inbox.html";
    });

    // goes to scores-tab
    document.getElementById("scores-tab").addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "sidebars/sd_scores.html";
    });

    // goes to analyze-tab
    document.getElementById("analyze-tab").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "sidebars/sd_analyze.html";
    });

    // goes to ranking-tab
    document.getElementById("ranking-tab").addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "sidebars/sd_ranking.html";
    });
});

// Sidebars Navigation
document.addEventListener("DOMContentLoaded", function () {

    // goes to home-tab
    document.getElementById("sd-home-tab").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "../homepage.html";
    });

    // goes to quizzes-tab
    document.getElementById("sd-quizzes-tab").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "sd_quizzes.html";
    });

    // goes to inbox-tab
    document.getElementById("sd-inbox-tab").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "sd_inbox.html";
    });

    // goes to scores-tab
    document.getElementById("sd-scores-tab").addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "sd_scores.html";
    });

    // goes to analyze-tab
    document.getElementById("sd-analyze-tab").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "sd_analyze.html";
    });

    // goes to ranking-tab
    document.getElementById("sd-ranking-tab").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "sd_ranking.html";
    });
});