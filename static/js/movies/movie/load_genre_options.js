document.addEventListener("DOMContentLoaded", loadGenreOptions);

async function loadGenreOptions() {
    const select = document.getElementById("id_genre");

    if (!select) {
        document.dispatchEvent(new CustomEvent("genresLoaded", {
            detail: { success: false }
        }));
        return;
    }

    const apiUrl = select.dataset.apiUrl;

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        const genres = data.genres || [];

        if (!genres.length) {
            select.innerHTML = `<option disabled>No genres available</option>`;
        } else {
            select.innerHTML = genres
                .map(genre => `<option value="${genre.id}">${escapeHtml(genre.name)}</option>`)
                .join("");
        }

        document.dispatchEvent(new CustomEvent("genresLoaded", {
            detail: { success: true }
        }));
    } catch (error) {
        select.innerHTML = `<option disabled>Failed to load genres</option>`;
        console.error("Failed to load genres:", error);

        document.dispatchEvent(new CustomEvent("genresLoaded", {
            detail: { success: false, error }
        }));
    }
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}