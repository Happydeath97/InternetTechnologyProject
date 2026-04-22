function setupDeleteForms() {
    const deleteForms = document.querySelectorAll(".genre-delete-form");

    for (const form of deleteForms) {
        form.addEventListener("submit", submitGenreDeleteForm);
    }
}

async function submitGenreDeleteForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const genreId = form.dataset.genreId;

    try {
        const response = await fetch(`/api/genres/${genreId}/delete/`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": getCsrfToken(),
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete genre.");
        }

        await loadGenres();
    } catch (error) {
        console.error(error);
        alert("Failed to delete genre.");
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

document.addEventListener("genresLoaded", setupDeleteForms);