document.addEventListener("DOMContentLoaded", initMovieDelete);

function initMovieDelete() {
    const deleteButton = document.getElementById("movie-delete-button");

    if (!deleteButton) {
        return;
    }

    deleteButton.addEventListener("click", deleteMovie);
}

async function deleteMovie(event) {
    const button = event.currentTarget;
    const apiUrl = button.dataset.deleteApiUrl;
    const fallbackRedirectUrl = button.dataset.redirectUrl;

    const confirmed = window.confirm("Are you sure you want to delete this movie?");
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(apiUrl, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": getCsrfToken(),
                "Accept": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Failed to delete movie.");
            return;
        }

        window.location.href = data.redirect_url || fallbackRedirectUrl;
    } catch (error) {
        console.error("Movie delete failed:", error);
        alert("Failed to delete movie.");
    }
}

function getCsrfToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return csrfInput ? csrfInput.value : "";
}