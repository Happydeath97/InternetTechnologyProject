document.addEventListener("DOMContentLoaded", initMovieListPage);

async function initMovieListPage() {
    const moviesList = document.getElementById("movies-list");

    if (!moviesList) {
        return;
    }

    const apiUrl = moviesList.dataset.apiUrl;
    const detailUrlTemplate = moviesList.dataset.detailUrlTemplate;

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
        renderMovies(moviesList, data.movies || [], detailUrlTemplate);
    } catch (error) {
        moviesList.innerHTML = `<p>Failed to load movies.</p>`;
        console.error("Error while loading movies:", error);
    }
}

function renderMovies(container, movies, detailUrlTemplate) {
    if (!movies.length) {
        container.innerHTML = `<p>No movies found.</p>`;
        return;
    }

    container.innerHTML = movies
        .map((movie) => createMovieCard(movie, detailUrlTemplate))
        .join("");
}

function createMovieCard(movie, detailUrlTemplate) {
    const title = escapeHtml(movie.title ?? "Untitled");
    const releaseYear = movie.release_year
        ? `<p class="entity-meta">Release year: ${escapeHtml(String(movie.release_year))}</p>`
        : "";

    const rating = movie.avg_rating !== null && movie.avg_rating !== undefined
        ? `<p class="entity-meta">Rating: ${escapeHtml(String(movie.avg_rating))}/10</p>`
        : `<p class="entity-meta">No rating available</p>`;

    const authors = formatRelatedList(movie.authors, "full_name", "No authors");
    const genres = formatRelatedList(movie.genres, "name", "No genres");

    const detailUrl = detailUrlTemplate.replace("/0/", `/${movie.id}/`);

    return `
        <article class="entity-card">
            <h2 class="entity-title">
                <a href="${detailUrl}">${title}</a>
            </h2>

            ${releaseYear}
            ${rating}

            <p>Authors: ${authors}</p>
            <p>Genres: ${genres}</p>

            <div class="entity-actions">
                <a href="${detailUrl}" class="btn">View detail</a>
            </div>
        </article>
    `;
}

function formatRelatedList(items, key, emptyText) {
    if (!Array.isArray(items) || items.length === 0) {
        return emptyText;
    }

    return items
        .map((item) => escapeHtml(item[key] ?? ""))
        .join(", ");
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}