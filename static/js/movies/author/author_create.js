function setupAuthorCreateForm() {
    const form = document.getElementById("author-create-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", submitAuthorCreateForm);
}

async function submitAuthorCreateForm(event) {
    event.preventDefault();

    clearAuthorCreateErrors();

    const fullNameInput = document.getElementById("full_name");
    const dateOfBirthInput = document.getElementById("date_of_birth");
    const formError = document.getElementById("form-error");

    const formData = new FormData();
    formData.append("full_name", fullNameInput.value);
    formData.append("date_of_birth", dateOfBirthInput.value);

    try {
        const response = await fetch("/api/authors/create/", {
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

        displayAuthorCreateErrors(data);
    } catch (error) {
        console.error(error);
        formError.textContent = "An unexpected error occurred.";
    }
}

function clearAuthorCreateErrors() {
    document.getElementById("full_name-error").textContent = "";
    document.getElementById("date_of_birth-error").textContent = "";
    document.getElementById("form-error").textContent = "";
}

function displayAuthorCreateErrors(data) {
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
        formError.textContent = "Failed to create author.";
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

document.addEventListener("DOMContentLoaded", setupAuthorCreateForm);