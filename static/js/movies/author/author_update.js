document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("author-update-page");

    if (!page) {
        return;
    }

    const form = document.getElementById("author-update-form");
    const fullNameInput = document.getElementById("author-full-name");
    const dateOfBirthInput = document.getElementById("author-date-of-birth");
    const errorBox = document.getElementById("author-update-errors");

    const detailApiUrl = page.dataset.detailApiUrl;
    const updateApiUrl = page.dataset.updateApiUrl;
    const redirectUrl = page.dataset.redirectUrl;

    initAuthorUpdatePage();

    async function initAuthorUpdatePage() {
        clearErrors();

        try {
            await loadAuthorDetails();
        } catch {
            showErrorMessage("Could not load author details.");
            return;
        }

        bindAuthorUpdateForm();
    }

    async function loadAuthorDetails() {
        const response = await fetch(detailApiUrl, {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
            },
        });

        const data = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error("Failed to load author details.");
        }

        const author = data && data.author ? data.author : data;

        fullNameInput.value = author.full_name || "";
        dateOfBirthInput.value = author.date_of_birth || "";
    }

    function bindAuthorUpdateForm() {
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
                date_of_birth: dateOfBirthInput.value || null,
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
            } catch {
                showErrorMessage("Could not update author.");
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