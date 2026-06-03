const movieDetailPage = document.getElementById("movie-detail-page");

const moviePoster = document.getElementById("movie-poster");
const moviePosterInitials = document.getElementById("movie-poster-initials");
const movieDetailPills = document.getElementById("movie-detail-pills");
const movieTitle = document.getElementById("movie-title");
const movieReleaseYearMeta = document.getElementById("movie-release-year-meta");
const movieAuthorsMeta = document.getElementById("movie-authors-meta");
const movieAvgRating = document.getElementById("movie-avg-rating");
const movieDescription = document.getElementById("movie-description");

const movieRatingCard = document.getElementById("movie-rating-card");
const movieUserRatingPanel = document.getElementById("movie-user-rating-panel");

const movieReportButton = document.getElementById("movie-report-button");

const movieId = movieDetailPage.dataset.movieId;
const movieApiUrl = movieDetailPage.dataset.movieApiUrl;
const ratingsApiUrl = movieDetailPage.dataset.ratingsApiUrl;

const canRateMovie = movieDetailPage.dataset.canRate === "true";
const canChangeRating = movieDetailPage.dataset.canChangeRating === "true";
const canDeleteRating = movieDetailPage.dataset.canDeleteRating === "true";

let selectedPersonalRating = null;

document.addEventListener("DOMContentLoaded", () => {
    loadMovieDetail();
});

async function loadMovieDetail() {
    try {
        const movieResponse = await fetch(movieApiUrl);

        if (!movieResponse.ok) {
            throw new Error("Failed to fetch movie detail.");
        }

        const movieData = await movieResponse.json();

        let currentUserRating = null;

        if (canRateMovie || canChangeRating || canDeleteRating) {
            currentUserRating = await loadCurrentUserRating();
        }

        renderMovieDetail(
            movieData.movie,
            movieData.permissions || {},
            currentUserRating
        );
    } catch (error) {
        console.error(error);
        renderMovieDetailError();
    }
}

async function loadCurrentUserRating() {
    try {
        const url = new URL(ratingsApiUrl, window.location.origin);
        url.searchParams.set("movie_id", movieId);
        url.searchParams.set("mine", "true");

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch current user rating.");
        }

        const data = await response.json();
        const ratings = data.ratings || [];

        return ratings.length > 0 ? ratings[0] : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function renderMovieDetail(movie, permissions, currentUserRating) {
    renderMoviePoster(movie);
    renderMoviePills(movie);
    renderMovieText(movie);
    renderMovieRating(movie, currentUserRating);
    renderMovieActions(movie, permissions);
}

function renderMoviePoster(movie) {
    const initials = getInitials(movie.title);

    moviePosterInitials.textContent = initials;

    if (movie.image_url) {
        moviePoster.style.backgroundImage = `url("${movie.image_url}")`;
        moviePoster.classList.add("has-image");
        moviePosterInitials.style.display = "none";
    } else {
        moviePoster.style.backgroundImage = "";
        moviePoster.classList.remove("has-image");
        moviePosterInitials.style.display = "block";
    }
}

function renderMoviePills(movie) {
    const pillsContainer = document.getElementById("movie-detail-pills");

    if (!pillsContainer) {
        return;
    }

    pillsContainer.innerHTML = "";

    const genres = Array.isArray(movie.genres) ? movie.genres : [];

    genres.forEach((genre) => {
        const genrePill = document.createElement("span");
        genrePill.className = "movie-detail-pill movie-detail-genre-pill";
        genrePill.textContent = getGenreName(genre);

        pillsContainer.appendChild(genrePill);
    });

    if (movie.release_year) {
        const yearPill = document.createElement("span");
        yearPill.className = "movie-detail-pill movie-detail-year-pill";
        yearPill.textContent = movie.release_year;

        pillsContainer.appendChild(yearPill);
    }
}

function getGenreName(genre) {
    if (!genre) {
        return "Unknown";
    }

    if (typeof genre === "string") {
        return genre;
    }

    if (genre.name) {
        return genre.name;
    }

    if (genre.title) {
        return genre.title;
    }

    return `Genre ${genre.id}`;
}

function renderMovieText(movie) {
    movieTitle.textContent = movie.title || "Untitled movie";

    movieReleaseYearMeta.textContent = movie.release_year
        ? `▣ ${movie.release_year}`
        : "▣ Unknown year";

    movieAuthorsMeta.textContent = movie.authors && movie.authors.length > 0
        ? `▣ ${formatAuthors(movie.authors)}`
        : "▣ Unknown author";

    movieDescription.textContent = movie.description || "No description available.";
}

function renderMovieRating(movie, currentUserRating) {
    movieAvgRating.textContent = movie.avg_rating !== null && movie.avg_rating !== undefined
        ? Number(movie.avg_rating).toFixed(1)
        : "-";

    if (!canRateMovie && !currentUserRating) {
        movieRatingCard.classList.remove("has-user-rating-panel");
        movieUserRatingPanel.innerHTML = "";
        return;
    }

    movieRatingCard.classList.add("has-user-rating-panel");

    if (currentUserRating) {
        renderExistingUserRating(currentUserRating);
        return;
    }

    renderUserRatingForm();
}

function renderExistingUserRating(currentUserRating) {
    const canShowActions = canChangeRating || canDeleteRating;

    movieUserRatingPanel.innerHTML = `
        <div class="movie-user-rating-value">
            <span>★</span>
            <strong>${currentUserRating.score}</strong>
            <small>/10</small>
        </div>

        <p class="movie-user-rating-label">
            Your rating
        </p>

        ${canShowActions ? `
            <div class="movie-user-rating-actions">
                ${canChangeRating ? `
                    <button
                        type="button"
                        class="movie-user-rating-action"
                        id="change-user-rating-button"
                    >
                        Change
                    </button>
                ` : ""}

                ${canDeleteRating ? `
                    <button
                        type="button"
                        class="movie-user-rating-action danger"
                        id="delete-user-rating-button"
                    >
                        Delete
                    </button>
                ` : ""}
            </div>
        ` : ""}
    `;

    bindExistingUserRatingEvents(currentUserRating);
}

function bindExistingUserRatingEvents(currentUserRating) {
    const changeButton = document.getElementById("change-user-rating-button");
    const deleteButton = document.getElementById("delete-user-rating-button");

    if (changeButton) {
        changeButton.addEventListener("click", () => {
            renderUserRatingForm(currentUserRating);
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener("click", () => {
            deletePersonalRating(currentUserRating.id);
        });
    }
}

function renderUserRatingForm(existingRating = null) {
    selectedPersonalRating = existingRating ? Number(existingRating.score) : null;

    movieUserRatingPanel.innerHTML = `
        <form class="movie-user-rating-form" id="movie-user-rating-form">
            <p class="movie-user-rating-label">
                ${existingRating ? "Change rating" : "Rate this movie"}
            </p>

            <div class="rating-score-options" id="rating-score-options">
                ${createRatingButtons(selectedPersonalRating)}
            </div>

            <div class="rating-form-actions">
                <button
                    type="submit"
                    class="rating-submit-button"
                    id="rating-submit-button"
                    ${existingRating ? "disabled" : "disabled"}
                >
                    ${existingRating ? "Update" : "Submit"}
                </button>

                ${existingRating ? `
                    <button
                        type="button"
                        class="rating-cancel-button"
                        id="rating-cancel-button"
                    >
                        Cancel
                    </button>
                ` : ""}
            </div>

            <p class="rating-form-message" id="rating-form-message"></p>
        </form>
    `;

    bindRatingFormEvents(existingRating);
}

function createRatingButtons(activeScore = null) {
    let buttons = "";

    for (let score = 1; score <= 10; score++) {
        const activeClass = Number(activeScore) === score ? "active" : "";

        buttons += `
            <button
                type="button"
                class="rating-score-option ${activeClass}"
                data-score="${score}"
            >
                ${score}
            </button>
        `;
    }

    return buttons;
}

function bindRatingFormEvents(existingRating = null) {
    const ratingForm = document.getElementById("movie-user-rating-form");
    const ratingSubmitButton = document.getElementById("rating-submit-button");
    const cancelButton = document.getElementById("rating-cancel-button");

    document.querySelectorAll(".rating-score-option").forEach(button => {
        button.addEventListener("click", () => {
            selectedPersonalRating = Number(button.dataset.score);

            document.querySelectorAll(".rating-score-option").forEach(option => {
                option.classList.remove("active");
            });

            button.classList.add("active");

            if (existingRating) {
                ratingSubmitButton.disabled = selectedPersonalRating === Number(existingRating.score);
            } else {
                ratingSubmitButton.disabled = false;
            }
        });
    });

    ratingForm.addEventListener("submit", event => {
        event.preventDefault();

        if (existingRating) {
            updatePersonalRating(existingRating.id);
        } else {
            submitPersonalRating();
        }
    });

    if (cancelButton && existingRating) {
        cancelButton.addEventListener("click", () => {
            renderExistingUserRating(existingRating);
        });
    }
}

async function submitPersonalRating() {
    if (!selectedPersonalRating) {
        showRatingFormMessage("Please select a score first.", "error");
        return;
    }

    try {
        const response = await fetch(ratingsApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify({
                movie_id: Number(movieId),
                score: selectedPersonalRating,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const message = getApiErrorMessage(data);
            showRatingFormMessage(message, "error");
            return;
        }

        await refreshRatingArea();
    } catch (error) {
        console.error(error);
        showRatingFormMessage("Could not submit rating.", "error");
    }
}

async function updatePersonalRating(ratingId) {
    if (!selectedPersonalRating) {
        showRatingFormMessage("Please select a score first.", "error");
        return;
    }

    try {
        const response = await fetch(`${ratingsApiUrl}${ratingId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify({
                score: selectedPersonalRating,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const message = getApiErrorMessage(data);
            showRatingFormMessage(message, "error");
            return;
        }

        await refreshRatingArea();
    } catch (error) {
        console.error(error);
        showRatingFormMessage("Could not update rating.", "error");
    }
}

async function deletePersonalRating(ratingId) {
    const confirmed = window.confirm("Delete your rating for this movie?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${ratingsApiUrl}${ratingId}/`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
        });

        if (!response.ok) {
            const data = await response.json();
            const message = getApiErrorMessage(data);
            alert(message);
            return;
        }

        await refreshRatingArea();
    } catch (error) {
        console.error(error);
        alert("Could not delete rating.");
    }
}

async function refreshRatingArea() {
    const movieResponse = await fetch(movieApiUrl);

    if (!movieResponse.ok) {
        throw new Error("Failed to refresh movie rating.");
    }

    const movieData = await movieResponse.json();
    const currentUserRating = await loadCurrentUserRating();

    renderMovieRating(movieData.movie, currentUserRating);
}

function showRatingFormMessage(message, type) {
    const messageElement = document.getElementById("rating-form-message");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.className = `rating-form-message ${type}`;
}

function getApiErrorMessage(data) {
    if (!data) {
        return "Something went wrong.";
    }

    if (data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorValue = data.errors[firstErrorKey];

        if (Array.isArray(firstErrorValue)) {
            return firstErrorValue[0];
        }

        return String(firstErrorValue);
    }

    if (data.error) {
        return data.error;
    }

    return "Something went wrong.";
}

function renderMovieActions(movie, permissions) {
    if (movie.can_report && movieReportButton) {
        movieReportButton.style.display = "inline-flex";
    }
}

function renderMovieDetailError() {
    movieTitle.textContent = "Movie could not be loaded.";
    movieReleaseYearMeta.textContent = "";
    movieAuthorsMeta.textContent = "";
    movieAvgRating.textContent = "-";
    movieDescription.textContent = "Please try again later.";
    movieDetailPills.innerHTML = "";
    moviePosterInitials.textContent = "!";

    if (movieUserRatingPanel) {
        movieUserRatingPanel.innerHTML = "";
    }
}

function formatAuthors(authors) {
    return authors
        .map(author => author.full_name)
        .join(", ");
}

function getInitials(title) {
    if (!title) {
        return "?";
    }

    return title
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .toUpperCase();
}

function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split(";") : [];

    for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();

        if (trimmedCookie.startsWith(`${name}=`)) {
            return decodeURIComponent(trimmedCookie.substring(name.length + 1));
        }
    }

    return "";
}