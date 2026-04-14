document.addEventListener("DOMContentLoaded", initMovieCreatePage);

function initMovieCreatePage() {
    const form = document.getElementById("movie-create-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", submitMovieCreateForm);
}

async function submitMovieCreateForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const apiUrl = form.dataset.apiUrl;
    const errorsContainer = document.getElementById("movie-create-errors");

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
        errorsContainer.innerHTML = "<p>Failed to create movie.</p>";
        console.error("Movie create failed:", error);
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