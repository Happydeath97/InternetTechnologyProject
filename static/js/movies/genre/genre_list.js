document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("genre-management-page");

    if (!page) {
        return;
    }

    const genreList = document.getElementById("genre-list");
    const genreCount = document.getElementById("genre-count");
    const genreSearch = document.getElementById("genre-search");
    const errorBox = document.getElementById("genre-error-box");

    const genresApiUrl = page.dataset.genresApiUrl;
    const genreDetailApiUrlTemplate = page.dataset.genreDetailApiUrlTemplate;
    const genreUpdateUrlTemplate = page.dataset.genreUpdateUrlTemplate;

    const canChange = page.dataset.canChange === "true";
    const canDelete = page.dataset.canDelete === "true";

    let genres = [];

    initGenreListPage();

    async function initGenreListPage() {
        clearError();

        await loadGenres();

        if (genreSearch) {
            genreSearch.addEventListener("input", () => {
                renderGenres();
            });
        }
    }

    async function loadGenres() {
        try {
            const response = await fetch(genresApiUrl, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json",
                },
            });

            const data = await parseJsonResponse(response);

            if (!response.ok) {
                showError("Could not load genres.");
                return;
            }

            genres = Array.isArray(data.genres) ? data.genres : [];
            renderGenres();
        } catch (error) {
            showError("Could not load genres.");
            console.error("Genre loading failed:", error);
        }
    }

    function renderGenres() {
        if (!genreList) {
            return;
        }

        const searchValue = genreSearch ? genreSearch.value.trim().toLowerCase() : "";

        const filteredGenres = genres.filter((genre) => {
            return getGenreName(genre).toLowerCase().includes(searchValue);
        });

        updateGenreCount(filteredGenres.length);

        if (!filteredGenres.length) {
            genreList.innerHTML = `<p class="genre-empty-state">No genres found.</p>`;
            return;
        }

        genreList.innerHTML = "";

        filteredGenres.forEach((genre) => {
            genreList.appendChild(createGenreRow(genre));
        });
    }

    function createGenreRow(genre) {
        const row = document.createElement("div");
        row.className = "genre-row";

        const name = document.createElement("div");
        name.className = "genre-name";
        name.textContent = getGenreName(genre);

        const actions = document.createElement("div");
        actions.className = "genre-actions";

        if (canChange) {
            const editLink = document.createElement("a");
            editLink.className = "genre-action-button genre-edit-button";
            editLink.href = buildUrlFromTemplate(genreUpdateUrlTemplate, genre.id);
            editLink.textContent = "Edit";
            actions.appendChild(editLink);
        }

        if (canDelete) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "genre-action-button genre-delete-button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteGenre(genre);
            });

            actions.appendChild(deleteButton);
        }

        row.appendChild(name);
        row.appendChild(actions);

        return row;
    }

    async function deleteGenre(genre) {
        const genreName = getGenreName(genre);

        const confirmed = window.confirm(`Delete genre "${genreName}"?`);

        if (!confirmed) {
            return;
        }

        clearError();

        try {
            const response = await fetch(buildUrlFromTemplate(genreDetailApiUrlTemplate, genre.id), {
                method: "DELETE",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json",
                    "X-CSRFToken": getCsrfToken(),
                },
            });

            const data = await parseJsonResponse(response);

            if (!response.ok) {
                showApiErrors(data);
                return;
            }

            genres = genres.filter((item) => item.id !== genre.id);
            renderGenres();
        } catch (error) {
            showError("Could not delete genre.");
            console.error("Genre delete failed:", error);
        }
    }

    function buildUrlFromTemplate(template, id) {
        return template.replace("/0/", `/${id}/`);
    }

    function getGenreName(genre) {
        if (!genre) {
            return "Unknown genre";
        }

        if (genre.name) {
            return genre.name;
        }

        if (genre.title) {
            return genre.title;
        }

        return `Genre ${genre.id}`;
    }

    function updateGenreCount(count) {
        if (!genreCount) {
            return;
        }

        genreCount.textContent = count;
    }

    async function parseJsonResponse(response) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    function showApiErrors(data) {
        if (!data) {
            showError("Request failed.");
            return;
        }

        const errors = data.errors || data.error || data;

        if (typeof errors === "string") {
            showError(errors);
            return;
        }

        const messages = [];

        Object.entries(errors).forEach(([field, fieldErrors]) => {
            if (Array.isArray(fieldErrors)) {
                messages.push(`${field}: ${fieldErrors.join(" ")}`);
                return;
            }

            messages.push(`${field}: ${fieldErrors}`);
        });

        showError(messages.join(" "));
    }

    function showError(message) {
        if (!errorBox) {
            return;
        }

        errorBox.textContent = message;
        errorBox.style.display = "block";
    }

    function clearError() {
        if (!errorBox) {
            return;
        }

        errorBox.textContent = "";
        errorBox.style.display = "none";
    }

    function getCsrfToken() {
        const csrfInput = document.querySelector("[name=csrfmiddlewaretoken]");

        if (csrfInput) {
            return csrfInput.value;
        }

        return "";
    }
});