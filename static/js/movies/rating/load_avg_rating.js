document.addEventListener("DOMContentLoaded", initMovieRating);

async function initMovieRating() {
    const page = document.getElementById("movie-detail-page");
    if (!page) return;

    const movieId = page.dataset.movieId;
    if (!movieId) return;

    try {
        const response = await fetch(`/api/movies/${movieId}/rating/`);

        if (!response.ok) {
            throw new Error("Failed to fetch rating data.");
        }

        const data = await response.json();
        console.log(data)
        renderAverageRating(data);
        renderRatingControls(data, movieId);
    } catch (error) {
        renderAverageRatingError(error);
    }
}

function renderAverageRating(data) {
    const avgRatingElement = document.getElementById("movie-avg-rating");
    if (!avgRatingElement) return;

    if (data.average_score !== null && data.average_score !== undefined) {
        avgRatingElement.textContent = `${Number(data.average_score).toFixed(1)}/10`;
    } else {
        avgRatingElement.textContent = "No rating available";
    }
}

function renderRatingControls(data, movieId) {
    const container = document.getElementById("movie-rating-form-container");
    if (!container) return;

    if (data.user_rating && data.user_rating.id) {
        renderExistingRatingControls(container, data.user_rating);
        setupRatingUpdateForm();
        setupRatingDeleteButton();
        return;
    }

    if (data.can_vote) {
        renderCreateRatingForm(container);
        setupRatingCreateForm(movieId);
        return;
    }

    container.innerHTML = "";
}

function renderCreateRatingForm(container) {
    container.innerHTML = `
        <form id="movie-rating-create-form" class="movie-rating-form">
            <div class="movie-rating-controls">
                <label for="movie-score" class="movie-rating-label">Your rating:</label>
                <select id="movie-score" name="score" class="movie-rating-select">
                    ${buildScoreOptions()}
                </select>
                <button type="submit" class="btn movie-rating-button">Vote</button>
            </div>
            <p id="movie-rating-message" class="movie-rating-message"></p>
        </form>
    `;
}

function renderExistingRatingControls(container, userRating) {
    container.innerHTML = `
        <div class="movie-rating-existing">
            <p class="movie-rating-current">
                <strong>Your rating:</strong> ${userRating.score}/10
            </p>

            <form
                id="movie-rating-update-form"
                class="movie-rating-form"
                data-rating-id="${userRating.id}"
            >
                <div class="movie-rating-controls">
                    <label for="movie-score" class="movie-rating-label">Change rating:</label>
                    <select id="movie-score" name="score" class="movie-rating-select">
                        ${buildScoreOptions(userRating.score)}
                    </select>
                    <button type="submit" class="btn movie-rating-button">Update</button>
                    <button
                        type="button"
                        id="movie-rating-delete-button"
                        class="btn btn-danger"
                    >
                        Delete
                    </button>
                </div>
                <p id="movie-rating-message" class="movie-rating-message"></p>
            </form>
        </div>
    `;
}

function buildScoreOptions(selectedScore = null) {
    let html = "";

    for (let score = 1; score <= 10; score++) {
        const selected = score === selectedScore ? "selected" : "";
        html += `<option value="${score}" ${selected}>${score}</option>`;
    }

    return html;
}

function setupRatingCreateForm(movieId) {
    const form = document.getElementById("movie-rating-create-form");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const messageElement = document.getElementById("movie-rating-message");
        const score = document.getElementById("movie-score").value;
        const formData = new FormData();

        formData.append("score", score);

        try {
            const response = await fetch(`/api/movies/${movieId}/rate/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCsrfToken(),
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(extractErrorMessage(data, "Failed to save rating."));
            }

            window.location.reload();
        } catch (error) {
            if (messageElement) {
                messageElement.textContent = error.message;
            }
            console.error(error);
        }
    });
}

function setupRatingUpdateForm() {
    const form = document.getElementById("movie-rating-update-form");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const ratingId = form.dataset.ratingId;
        const messageElement = document.getElementById("movie-rating-message");
        const score = document.getElementById("movie-score").value;
        const formData = new FormData();

        formData.append("score", score);

        try {
            const response = await fetch(`/api/ratings/${ratingId}/edit/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCsrfToken(),
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(extractErrorMessage(data, "Failed to update rating."));
            }

            window.location.reload();
        } catch (error) {
            if (messageElement) {
                messageElement.textContent = error.message;
            }
            console.error(error);
        }
    });
}

function setupRatingDeleteButton() {
    const button = document.getElementById("movie-rating-delete-button");
    if (!button) return;

    button.addEventListener("click", async function () {
        const form = document.getElementById("movie-rating-update-form");
        const ratingId = form.dataset.ratingId;
        const messageElement = document.getElementById("movie-rating-message");

        try {
            const response = await fetch(`/api/ratings/${ratingId}/delete/`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": getCsrfToken(),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(extractErrorMessage(data, "Failed to delete rating."));
            }

            window.location.reload();
        } catch (error) {
            if (messageElement) {
                messageElement.textContent = error.message;
            }
            console.error(error);
        }
    });
}

function extractErrorMessage(data, fallbackMessage) {
    if (data.error) {
        return data.error;
    }

    if (data.errors) {
        if (Array.isArray(data.errors.score) && data.errors.score.length > 0) {
            return data.errors.score[0];
        }

        if (typeof data.errors.score === "string") {
            return data.errors.score;
        }
    }

    return fallbackMessage;
}

function renderAverageRatingError(error) {
    const avgRatingElement = document.getElementById("movie-avg-rating");

    if (avgRatingElement) {
        avgRatingElement.textContent = "Failed to load rating";
    }

    console.error(error);
}

function getCsrfToken() {
    const cookieValue = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="));

    return cookieValue ? cookieValue.split("=")[1] : "";
}