function setupAuthorUpdateForm() {
    const form = document.getElementById("author-update-form");

    if (!form) {
        return;
    }

    loadAuthorData();
    form.addEventListener("submit", submitAuthorUpdateForm);
}

async function loadAuthorData() {
    const form = document.getElementById("author-update-form");
    const authorId = form.dataset.authorId;
    const formError = document.getElementById("form-error");

    try {
        const response = await fetch(`/api/authors/${authorId}/`);

        if (!response.ok) {
            throw new Error("Failed to load author.");
        }

        const data = await response.json();
        const author = data.author;

        document.getElementById("full_name").value = author.full_name || "";
        document.getElementById("date_of_birth").value = author.date_of_birth || "";
    } catch (error) {
        console.error(error);
        formError.textContent = "Failed to load author data.";
    }
}

async function submitAuthorUpdateForm(event) {
    event.preventDefault();

    clearAuthorUpdateErrors();

    const form = document.getElementById("author-update-form");
    const authorId = form.dataset.authorId;
    const fullNameInput = document.getElementById("full_name");
    const dateOfBirthInput = document.getElementById("date_of_birth");
    const formError = document.getElementById("form-error");

    const formData = new FormData();
    formData.append("full_name", fullNameInput.value);
    formData.append("date_of_birth", dateOfBirthInput.value);

    try {
        const response = await fetch(`/api/authors/${authorId}/edit/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCsrfToken(),
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = "/authors/";
            return;
        }

        displayAuthorUpdateErrors(data);
    } catch (error) {
        console.error(error);
        formError.textContent = "An unexpected error occurred.";
    }
}

function clearAuthorUpdateErrors() {
    document.getElementById("full_name-error").textContent = "";
    document.getElementById("date_of_birth-error").textContent = "";
    document.getElementById("form-error").textContent = "";
}

function displayAuthorUpdateErrors(data) {
    const fullNameError = document.getElementById("full_name-error");
    const dateOfBirthError = document.getElementById("date_of_birth-error");
    const formError = document.getElementById("form-error");

    let hasFieldError = false;

    if (data.errors) {
        if (data.errors.full_name) {
            fullNameError.textContent = data.errors.full_name.join(" ");
            hasFieldError = true;
        }

        if (data.errors.date_of_birth) {
            dateOfBirthError.textContent = data.errors.date_of_birth.join(" ");
            hasFieldError = true;
        }

        if (data.errors.__all__) {
            formError.textContent = data.errors.__all__.join(" ");
            return;
        }
    }

    if (!hasFieldError) {
        formError.textContent = "Failed to update author.";
    }
}

function getCsrfToken() {
    const cookieName = "csrftoken";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        cookie = cookie.trim();

        if (cookie.startsWith(cookieName + "=")) {
            return cookie.substring(cookieName.length + 1);
        }
    }

    return "";
}

document.addEventListener("DOMContentLoaded", setupAuthorUpdateForm);