document.addEventListener("DOMContentLoaded", () => {
    const profilePage = document.getElementById("profile-page");
    const ratingsTableBody = document.getElementById("ratings-table-body");
    const ratedMoviesCount = document.getElementById("rated-movies-count");

    if (!profilePage || !ratingsTableBody || !ratedMoviesCount) {
        return;
    }

    const ratingsApiUrl = profilePage.dataset.ratingsApiUrl;
    const movieDetailBaseUrl = profilePage.dataset.movieDetailBaseUrl;

    loadUserRatings();

    async function loadUserRatings() {
        try {
            const url = new URL(ratingsApiUrl, window.location.origin);
            url.searchParams.set("mine", "true");

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to load user ratings.");
            }

            const data = await response.json();
            const ratings = data.ratings || [];

            renderRatings(ratings);
            ratedMoviesCount.textContent = ratings.length;
        } catch (error) {
            console.error(error);
            ratingsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="ratings-empty-cell error">
                        Could not load your ratings.
                    </td>
                </tr>
            `;
        }
    }

    function renderRatings(ratings) {
        ratingsTableBody.innerHTML = "";

        if (ratings.length === 0) {
            ratingsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="ratings-empty-cell">
                        You have not rated any movies yet.
                    </td>
                </tr>
            `;
            return;
        }

        ratings.forEach(rating => {
            ratingsTableBody.appendChild(createRatingRow(rating));
        });
    }

    function createRatingRow(rating) {
        const row = document.createElement("tr");

        const movieId = rating.movie?.id;
        const movieTitle = rating.movie?.title || "Unknown movie";
        const movieUrl = `${movieDetailBaseUrl}${movieId}/`;

        row.innerHTML = `
            <td>
                <a href="${movieUrl}" class="rating-movie-link">
                    ${escapeHtml(movieTitle)}
                </a>
            </td>
            <td>
                <span class="rating-score">★ ${rating.score}/10</span>
            </td>
            <td>${rating.created_at || "-"}</td>
            <td>${rating.updated_at || "-"}</td>
            <td class="rating-action-cell">
                <a href="${movieUrl}" class="rating-open-link">
                    Open
                </a>
            </td>
        `;

        return row;
    }

    function escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = value;
        return div.innerHTML;
    }
});