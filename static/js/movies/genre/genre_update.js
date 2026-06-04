document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("genre-update-page");

    if (!page) {
        return;
    }

    const form = document.getElementById("genre-update-form");
    const nameInput = document.getElementById("genre-name");
    const errorBox = document.getElementById("genre-update-errors");

    const detailApiUrl = page.dataset.detailApiUrl;
    const updateApiUrl = page.dataset.updateApiUrl;
    const redirectUrl = page.dataset.redirectUrl;

    initGenreUpdatePage();

    async function initGenreUpdatePage() {
        clearErrors();

        try {
            await loadGenreDetails();
        } catch (error) {
            showErrorMessage("Could not load genre details.");
            console.error("Genre detail loading failed:", error);
            return;
        }

        bindGenreUpdateForm();
    }

    async function loadGenreDetails() {
        const response = await fetch(detailApiUrl, {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
            },
        });

        const data = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error("Failed to load genre details.");
        }

        const genre = data && data.genre ? data.genre : data;

        nameInput.value = genre.name || "";
    }

    function bindGenreUpdateForm() {
        if (!form) {
            return;
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            clearErrors();

            const payload = {
                name: nameInput.value.trim(),
            };

            try {
                const response = await fetch(updateApiUrl, {
                    method: "PATCH",
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
                showErrorMessage("Could not update genre.");
                console.error("Genre update failed:", error);
            }
        });
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

        Object.entries(errors).forEach(([field, fieldErrors]) => {
            if (Array.isArray(fieldErrors)) {
                messages.push(`${field}: ${fieldErrors.join(" ")}`);
                return;
            }

            if (typeof fieldErrors === "object" && fieldErrors !== null) {
                messages.push(`${field}: ${JSON.stringify(fieldErrors)}`);
                return;
            }

            messages.push(`${field}: ${fieldErrors}`);
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