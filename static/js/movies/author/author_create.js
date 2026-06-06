document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("author-create-page");

    if (!page) {
        return;
    }

    const form = document.getElementById("author-create-form");
    const fullNameInput = document.getElementById("author-full-name");
    const dateOfBirthInput = document.getElementById("author-date-of-birth");
    const errorBox = document.getElementById("author-create-errors");

    const createApiUrl = page.dataset.createApiUrl;
    const redirectUrl = page.dataset.redirectUrl;

    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearErrors();

        const fullName = fullNameInput.value.trim();

        if (!fullName) {
            showErrorMessage("Author full name cannot be empty.");
            return;
        }

        const payload = {
            full_name: fullName,
        };

        if (dateOfBirthInput.value) {
            payload.date_of_birth = dateOfBirthInput.value;
        }

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
        } catch {
            showErrorMessage("Could not create author.");
        }
    });

    async function parseJsonResponse(response) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    function showApiErrors(data) {
        if (!data) {
            showErrorMessage("Invalid author data.");
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