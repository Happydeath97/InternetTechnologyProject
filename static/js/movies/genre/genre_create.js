async function submitGenreCreateForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const apiUrl = form.dataset.apiUrl;
    const redirectUrl = form.dataset.redirectUrl;

    clearGenreCreateErrors();

    const formData = new FormData(form);

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = redirectUrl;
            return;
        }

        if (response.status === 400 && data.errors) {
            renderGenreCreateErrors(data.errors);
            return;
        }

        document.getElementById("form-errors").innerHTML = "<p>Failed to create genre.</p>";
    } catch (error) {
        document.getElementById("form-errors").innerHTML = "<p>Failed to create genre.</p>";
        console.error(error);
    }
}

function clearGenreCreateErrors() {
    document.getElementById("name-errors").innerHTML = "";
    document.getElementById("form-errors").innerHTML = "";
}

function renderGenreCreateErrors(errors) {
    const nameErrors = document.getElementById("name-errors");
    const formErrors = document.getElementById("form-errors");

    if (errors.name) {
        nameErrors.innerHTML = errors.name.map(error => `<p>${error}</p>`).join("");
    }

    for (const [field, fieldErrors] of Object.entries(errors)) {
        if (field === "name") {
            continue;
        }

        formErrors.innerHTML += fieldErrors.map(error => `<p>${error}</p>`).join("");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("genre-create-form");

    if (form) {
        form.addEventListener("submit", submitGenreCreateForm);
    }
});