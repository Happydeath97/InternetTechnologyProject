document.addEventListener("DOMContentLoaded", initMovieUpdatePage);

let authorsReady = false;
let genresReady = false;
let movieData = null;

function initMovieUpdatePage() {
    const form = document.getElementById("movie-update-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", submitMovieUpdateForm);

    document.addEventListener("authorsLoaded", handleAuthorsLoaded);
    document.addEventListener("genresLoaded", handleGenresLoaded);

    loadMovieData(form);
}

function handleAuthorsLoaded() {
    authorsReady = true;
    tryApplySelections();
}

function handleGenresLoaded() {
    genresReady = true;
    tryApplySelections();
}

async function loadMovieData(form) {
    const detailApiUrl = form.dataset.detailApiUrl;

    try {
        const response = await fetch(detailApiUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        movieData = data.movie;

        document.getElementById("id_title").value = movieData.title || "";
        document.getElementById("id_description").value = movieData.description || "";
        document.getElementById("id_release_year").value = movieData.release_year || "";

        tryApplySelections();
    } catch (error) {
        console.error("Failed to load movie data:", error);
    }
}

function tryApplySelections() {
    if (!movieData || !authorsReady || !genresReady) {
        return;
    }

    setSelectedOptions("id_author", movieData.author || movieData.authors || []);
    setSelectedOptions("id_genre", movieData.genre || movieData.genres || []);
}

function setSelectedOptions(selectId, items) {
    const select = document.getElementById(selectId);

    if (!select || !Array.isArray(items)) {
        return;
    }

    const selectedIds = items.map(item => String(item.id));

    for (const option of select.options) {
        option.selected = selectedIds.includes(String(option.value));
    }
}

async function submitMovieUpdateForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const apiUrl = form.dataset.updateApiUrl;
    const errorsContainer = document.getElementById("movie-update-errors");

    errorsContainer.innerHTML = "";

    const formData = new FormData(form);

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": getCsrfToken(),
                "Accept": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            renderFormErrors(errorsContainer, data.errors || {});
            return;
        }

        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        }
    } catch (error) {
        errorsContainer.innerHTML = "<p>Failed to update movie.</p>";
        console.error("Movie update failed:", error);
    }
}

function renderFormErrors(container, errors) {
    const entries = Object.entries(errors);

    if (!entries.length) {
        container.innerHTML = "<p>Unknown validation error.</p>";
        return;
    }

    container.innerHTML = entries
        .map(([field, messages]) => {
            const joined = Array.isArray(messages) ? messages.join(", ") : messages;
            return `<p><strong>${escapeHtml(field)}:</strong> ${escapeHtml(joined)}</p>`;
        })
        .join("");
}

function getCsrfToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return csrfInput ? csrfInput.value : "";
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}