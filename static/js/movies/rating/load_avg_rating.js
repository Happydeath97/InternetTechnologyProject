document.addEventListener("DOMContentLoaded", initMovieRating);

async function initMovieRating() {
    const page = document.getElementById("movie-detail-page");
    if (!page) return;

    const movieId = page.dataset.movieId;
    if (!movieId) return;

    try {
        const response = await fetch(`/api/rating/${movieId}/`);

        if (!response.ok) {
            throw new Error("Failed to fetch average rating.");
        }

        const data = await response.json();
        renderAverageRating(data);
        renderVoteForm(data, movieId);
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

function renderVoteForm(data, movieId) {
    const container = document.getElementById("movie-rating-form-container");
    if (!container) return;

    if (!data.can_vote) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = `
        <form id="movie-rating-form" class="movie-rating-form">
            <div class="movie-rating-controls">
                <label for="movie-score" class="movie-rating-label">Your rating:</label>
                <select id="movie-score" name="score" class="movie-rating-select">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </select>
                <button type="submit" class="btn movie-rating-button">Vote</button>
            </div>
            <p id="movie-rating-message" class="movie-rating-message"></p>
        </form>
    `;

    const form = document.getElementById("movie-rating-form");
    form.addEventListener("submit", (event) => submitRatingForm(event, movieId));
}

async function submitRatingForm(event, movieId) {
    event.preventDefault();

    const scoreElement = document.getElementById("movie-score");
    const messageElement = document.getElementById("movie-rating-message");

    try {
        const response = await fetch(`/api/rating/${movieId}/vote/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken(),
            },
            body: JSON.stringify({
                score: Number(scoreElement.value),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to save rating.");
        }

        if (messageElement) {
            messageElement.textContent = "Rating saved successfully.";
        }

        await initMovieRating();
    } catch (error) {
        if (messageElement) {
            messageElement.textContent = error.message;
        }
        console.error(error);
    }
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