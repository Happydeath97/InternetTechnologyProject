document.addEventListener("DOMContentLoaded", initMovieDetailPage);

async function initMovieDetailPage() {
    const page = document.getElementById("movie-detail-page");
    if (!page) return;

    const movieId = page.dataset.movieId;

    try {
        const response = await fetch(`/api/movies/${movieId}/`);

        if (!response.ok) {
            throw new Error("Failed to fetch movie detail.");
        }

        const data = await response.json();
        renderMovieDetail(data);
    } catch (error) {
        renderMovieDetailError(error);
    }
}

function renderMovieDetail(data) {
    const movie = data.movie;
    const permissions = data.permissions || {};

    renderTitle(movie);
    renderMeta(movie);
    renderDescription(movie);
    renderActions(movie, permissions);
}

function renderTitle(movie) {
    const titleElement = document.getElementById("movie-title");
    if (!titleElement) return;

    titleElement.textContent = movie.title;
    document.title = `${movie.title} | MoviePulse`;
}

function renderMeta(movie) {
    const releaseYearRow = document.getElementById("movie-release-year-row");
    const releaseYearElement = document.getElementById("movie-release-year");
    const authorsElement = document.getElementById("movie-authors");
    const genresElement = document.getElementById("movie-genres");

    if (releaseYearRow && releaseYearElement) {
        if (movie.release_year) {
            releaseYearRow.style.display = "block";
            releaseYearElement.textContent = movie.release_year;
        } else {
            releaseYearRow.style.display = "none";
        }
    }

    if (authorsElement) {
        authorsElement.textContent =
            movie.authors && movie.authors.length > 0
                ? movie.authors.map(author => author.full_name).join(", ")
                : "No authors";
    }

    if (genresElement) {
        genresElement.textContent =
            movie.genres && movie.genres.length > 0
                ? movie.genres.map(genre => genre.name).join(", ")
                : "No genres";
    }
}

function renderDescription(movie) {
    const descriptionSection = document.getElementById("movie-description-section");
    const descriptionElement = document.getElementById("movie-description");

    if (!descriptionSection || !descriptionElement) return;

    if (movie.description) {
        descriptionSection.style.display = "block";
        descriptionElement.textContent = movie.description;
    } else {
        descriptionSection.style.display = "none";
    }
}

function renderActions(movie, permissions) {
    const editButton = document.getElementById("edit-movie-btn");
    const deleteForm = document.getElementById("delete-movie-form");

    if (editButton) {
        if (permissions.can_edit_movie) {
            editButton.style.display = "inline-block";
            editButton.href = `/movies/${movie.id}/edit/`;
        } else {
            editButton.style.display = "none";
        }
    }

    if (deleteForm) {
        if (permissions.can_delete_movie) {
            deleteForm.style.display = "inline-block";
            deleteForm.action = `/movies/${movie.id}/delete/`;
        } else {
            deleteForm.style.display = "none";
        }
    }
}

function renderMovieDetailError(error) {
    const titleElement = document.getElementById("movie-title");
    const metaElement = document.getElementById("movie-meta");
    const descriptionSection = document.getElementById("movie-description-section");

    if (titleElement) {
        titleElement.textContent = "Failed to load movie";
    }

    if (metaElement) {
        metaElement.innerHTML = "<p>Could not load movie details.</p>";
    }

    if (descriptionSection) {
        descriptionSection.style.display = "none";
    }

    console.error(error);
}