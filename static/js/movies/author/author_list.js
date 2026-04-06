async function loadAuthors() {
    const container = document.getElementById("authors-list");
    const canUpdate = container.dataset.canUpdate === "true";
    const canDelete = container.dataset.canDelete === "true";

    try {
        const response = await fetch("/api/authors/");

        if (!response.ok) {
            throw new Error("Failed to fetch authors.");
        }

        const data = await response.json();
        const authors = data.authors;

        if (!authors || authors.length === 0) {
            container.innerHTML = "<p>No authors found.</p>";
            return;
        }

        let html = "";

        for (const author of authors) {
            html += `
                <div class="entity-row">
                    <div class="entity-main">
                        <div class="author-name">
                            <strong>${author.full_name}</strong>
                        </div>
                        <div class="author-age">
                            ${author.date_of_birth ?? ""}
                        </div>
                    </div>

                    <div class="entity-actions">
                        ${canUpdate ? `<a href="/authors/${author.id}/edit/" class="btn">Update</a>` : ""}

                        ${canDelete ? `
                            <form class="author-delete-form" data-author-id="${author.id}" style="display: inline;">
                                <button type="submit" class="btn btn-danger">Delete</button>
                            </form>
                        ` : ""}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        setupDeleteForms();
    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Failed to load authors.</p>";
    }
}

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
            method: "POST",
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

document.addEventListener("DOMContentLoaded", loadAuthors);