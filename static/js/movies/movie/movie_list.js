const API_MOVIES_URL = "/api/movies/";
const MOVIE_DETAIL_BASE_URL = "/movies/"; // adjust if your detail page URL differs
const API_GENRES_URL = "/api/genres/";

const genreFilterList = document.getElementById("genre-filter-list");
const movieGrid = document.getElementById("movie-results-grid");
const movieCount = document.getElementById("movie-count");
const resultCount = document.getElementById("result-count");
const movieSearchInput = document.getElementById("movie-search");
const releaseYearSelect = document.getElementById("release-year");
const minRatingInput = document.getElementById("min-rating");
const minRatingLabel = document.getElementById("min-rating-label");
const movieSortSelect = document.getElementById("movie-sort");

let selectedGenre = "";
let searchTitle = "";
let selectedReleaseYear = "";
let selectedMinRating = 0;


document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    selectedGenre = params.get("genre") || "";

    populateReleaseYears();
    loadGenres();
    loadMovies();

    document.querySelector('[data-genre=""]').addEventListener("click", function () {
        selectedGenre = "";
        setActiveGenreButton(this);
        loadMovies();
    });

    movieSearchInput.addEventListener("input", () => {
        searchTitle = movieSearchInput.value.trim();
        loadMovies();
    });

    releaseYearSelect.addEventListener("change", () => {
        selectedReleaseYear = releaseYearSelect.value;
        loadMovies();
    });

    minRatingInput.addEventListener("input", () => {
        selectedMinRating = Number(minRatingInput.value);

        minRatingLabel.textContent = selectedMinRating === 0
            ? "Any"
            : `${selectedMinRating}+`;

        loadMovies();
    });
        movieSortSelect.addEventListener("change", () => {
        loadMovies();
    });
});

async function loadMovies() {
    try {
        const url = new URL(API_MOVIES_URL, window.location.origin);

        if (selectedGenre) {
            url.searchParams.set("genre", selectedGenre);
        }
        if (searchTitle) {
            url.searchParams.set("title", searchTitle);
        }
        if (selectedReleaseYear) {
            url.searchParams.set("release_year", selectedReleaseYear);
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch movies.");
        }

        const data = await response.json();
        let movies = data.movies || [];

        if (selectedMinRating > 0) {
            movies = movies.filter(movie => {
                return Number(movie.avg_rating || 0) >= selectedMinRating;
            });
        }

        movies = orderMovies(movies);

        renderMovies(movies);
        updateCounts(movies.length);
    } catch (error) {
        console.error(error);
        movieGrid.innerHTML = `<p class="error-message">Could not load movies.</p>`;
    }
}

function renderMovies(movies) {
    movieGrid.innerHTML = "";

    movies.forEach(movie => {
        movieGrid.appendChild(createMovieCard(movie));
    });
}

function createMovieCard(movie) {
    const card = document.createElement("a");
    card.className = "movie-card";
    card.href = `${MOVIE_DETAIL_BASE_URL}${movie.id}/`;

    const genreTags = (movie.genres || [])
    .map(genre => `<span>${genre.name}</span>`)
    .join("");
    const initials = getInitials(movie.title);
    const rating = movie.avg_rating ? Number(movie.avg_rating).toFixed(1) : "-";

    card.innerHTML = `
        <div class="movie-poster">
            ${initials}
            <div class="movie-genres">
                ${genreTags}
            </div>
        </div>

        <div class="movie-info">
            <h3>${movie.title}</h3>

            <div class="movie-meta">
                <span>${movie.release_year}</span>
                <span>
                    <strong>★ ${rating}</strong>
                </span>
            </div>
        </div>
    `;

    return card;
}

function updateCounts(count) {
    movieCount.textContent = count;
    resultCount.textContent = count;
}

function getInitials(title) {
    return title
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .toUpperCase();
}

async function loadGenres() {
    try {
        const response = await fetch(API_GENRES_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch genres.");
        }

        const data = await response.json();
        const genres = data.genres || [];
        renderGenreFilters(genres);
    } catch (error) {
        console.error(error);
    }
}

function renderGenreFilters(genres) {
    genres.forEach(genre => {
        const button = document.createElement("button");
        button.className = "genre-filter";
        button.dataset.genre = genre.name;
        button.textContent = genre.name;

        if (genre.name === selectedGenre) {
            button.classList.add("active");
            document.querySelector('[data-genre=""]').classList.remove("active");
        }

        button.addEventListener("click", () => {
            selectedGenre = genre.name;
            setActiveGenreButton(button);
            loadMovies();
        });

        genreFilterList.appendChild(button);
    });
}

function setActiveGenreButton(activeButton) {
    document.querySelectorAll(".genre-filter").forEach(button => {
        button.classList.remove("active");
    });

    activeButton.classList.add("active");
}

function populateReleaseYears() {
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 1888; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        releaseYearSelect.appendChild(option);
    }
}

function orderMovies(movies) {
    const sortValue = movieSortSelect.value;

    return [...movies].sort((a, b) => {
        switch (sortValue) {
            case "title_asc":
                return a.title.localeCompare(b.title);

            case "title_desc":
                return b.title.localeCompare(a.title);

            case "rating_desc":
                return Number(b.avg_rating || 0) - Number(a.avg_rating || 0);

            case "year_desc":
                return Number(b.release_year || 0) - Number(a.release_year || 0);

            case "year_asc":
                return Number(a.release_year || 0) - Number(b.release_year || 0);

            default:
                return 0;
        }
    });
}
