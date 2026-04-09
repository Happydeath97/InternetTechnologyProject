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
            document.dispatchEvent(new CustomEvent("authorsLoaded"));
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
        document.dispatchEvent(new CustomEvent("authorsLoaded"));
    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Failed to load authors.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadAuthors);