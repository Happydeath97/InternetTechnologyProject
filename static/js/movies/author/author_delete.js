function setupDeleteForms() {
    const deleteForms = document.querySelectorAll(".author-delete-form");

    for (const form of deleteForms) {
        form.addEventListener("submit", submitAuthorDeleteForm);
    }
}

async function submitAuthorDeleteForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const authorId = form.dataset.authorId;

    try {
        const response = await fetch(`/api/authors/${authorId}/delete/`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": getCsrfToken(),
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete author.");
        }

        await loadAuthors();
    } catch (error) {
        console.error(error);
        alert("Failed to delete author.");
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

document.addEventListener("authorsLoaded", setupDeleteForms);