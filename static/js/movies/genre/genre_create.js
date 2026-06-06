document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("genre-create-page");

    if (!page) {
        return;
    }

    const form = document.getElementById("genre-create-form");
    const nameInput = document.getElementById("genre-name");
    const errorBox = document.getElementById("genre-create-errors");

    const createApiUrl = page.dataset.createApiUrl;
    const redirectUrl = page.dataset.redirectUrl;

    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearErrors();

        const genreName = nameInput.value.trim().toLowerCase();

        if (!genreName) {
            showErrorMessage("Genre name cannot be empty.");
            return;
        }

        const genreAlreadyExists = await checkGenreExists(genreName);

        if (genreAlreadyExists) {
            showErrorMessage("Genre with this name already exists.");
            return;
        }

        const payload = {
            name: genreName,
        };

        try {
            const response = await fetch(createApiUrl, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRFToken": getCsrfToken(),
                },
                body: JSON.stringify(payload),
            });

            const data = await parseJsonResponse(response);

            if (!response.ok) {
                showApiErrors(data);
                return;
            }

            window.location.href = redirectUrl;
        } catch (error) {
            showErrorMessage("Could not create genre.");
        }
    });

    async function checkGenreExists(genreName) {
        try {
            const url = new URL(createApiUrl, window.location.origin);
            url.searchParams.set("name", genreName);

            const response = await fetch(url.toString(), {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json",
                },
            });

            const data = await parseJsonResponse(response);

            if (!response.ok || !data) {
                return false;
            }

            const genres = Array.isArray(data.genres) ? data.genres : [];

            return genres.some((genre) => {
                return normalizeText(genre.name) === normalizeText(genreName);
            });
        } catch {
            return false;
        }
    }

    function normalizeText(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    async function parseJsonResponse(response) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    function showApiErrors(data) {
        if (!data) {
            showErrorMessage("Invalid genre data.");
            return;
        }

        const errors = data.errors || data.error || data;

        if (typeof errors === "string") {
            showErrorMessage(errors);
            return;
        }

        const messages = [];

        Object.values(errors).forEach((fieldErrors) => {
            if (Array.isArray(fieldErrors)) {
                messages.push(fieldErrors.join(" "));
                return;
            }

            if (typeof fieldErrors === "object" && fieldErrors !== null) {
                messages.push(JSON.stringify(fieldErrors));
                return;
            }

            messages.push(fieldErrors);
        });

        showErrorMessage(messages.join(" "));
    }

    function showErrorMessage(message) {
        if (!errorBox) {
            return;
        }

        errorBox.textContent = message;
        errorBox.style.display = "block";
    }

    function clearErrors() {
        if (!errorBox) {
            return;
        }

        errorBox.textContent = "";
        errorBox.style.display = "none";
    }

    function getCsrfToken() {
        const csrfInput = document.querySelector("[name=csrfmiddlewaretoken]");

        if (csrfInput) {
            return csrfInput.value;
        }

        return "";
    }
});