async function loadGenreDetails() {
    const form = document.getElementById("genre-update-form");
    const detailApiUrl = form.dataset.detailApiUrl;

    try {
        const response = await fetch(detailApiUrl);

        if (!response.ok) {
            throw new Error("Failed to fetch genre details.");
        }

        const data = await response.json();
        const genre = data.genre;

        document.getElementById("name").value = genre.name ?? "";
    } catch (error) {
        console.error(error);
        document.getElementById("form-errors").innerHTML = "<p>Failed to load genre.</p>";
    }
}

async function submitGenreUpdateForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const updateApiUrl = form.dataset.updateApiUrl;
    const redirectUrl = form.dataset.redirectUrl;

    clearGenreUpdateErrors();

    const formData = new FormData(form);

    try {
        const response = await fetch(updateApiUrl, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = redirectUrl;
            return;
        }

        if (response.status === 400 && data.errors) {
            renderGenreUpdateErrors(data.errors);
            return;
        }

        document.getElementById("form-errors").innerHTML = "<p>Failed to update genre.</p>";
    } catch (error) {
        console.error(error);
        document.getElementById("form-errors").innerHTML = "<p>Failed to update genre.</p>";
    }
}

function clearGenreUpdateErrors() {
    document.getElementById("name-errors").innerHTML = "";
    document.getElementById("form-errors").innerHTML = "";
}

function renderGenreUpdateErrors(errors) {
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

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("genre-update-form");

    if (form) {
        await loadGenreDetails();
        form.addEventListener("submit", submitGenreUpdateForm);
    }
});