async function loadGenres() {
    const container = document.getElementById("genres-list");
    const canUpdate = container.dataset.canUpdate === "true";
    const canDelete = container.dataset.canDelete === "true";

    try {
        const response = await fetch("/api/genres/");

        if (!response.ok) {
            throw new Error("Failed to fetch genres.");
        }

        const data = await response.json();
        const genres = data.genres;

        if (!genres || genres.length === 0) {
            container.innerHTML = "<p>No genres found.</p>";
            document.dispatchEvent(new CustomEvent("genresLoaded"));
            return;
        }

        let html = "";

        for (const genre of genres) {
            html += `
                <div class="entity-row">
                    <div class="entity-main">
                        <strong>${genre.name}</strong>
                    </div>

                    <div class="entity-actions">
                        ${canUpdate ? `<a href="/genres/${genre.id}/edit/" class="btn">Update</a>` : ""}
                        ${canDelete ? `
                            <form class="genre-delete-form" data-genre-id="${genre.id}" style="display: inline;">
                                <button type="submit" class="btn btn-danger">Delete</button>
                            </form>
                        ` : ""}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        document.dispatchEvent(new CustomEvent("genresLoaded"));
    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Failed to load genres.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadGenres);