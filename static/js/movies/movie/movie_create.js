document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("movie-create-form");

    if (!form) {
        return;
    }

    const titleInput = document.getElementById("id_title");
    const descriptionInput = document.getElementById("id_description");
    const releaseYearInput = document.getElementById("id_release_year");
    const authorSelect = document.getElementById("id_author");
    const genreSelect = document.getElementById("id_genre");
    const errorBox = document.getElementById("movie-create-errors");

    const createApiUrl = form.dataset.createApiUrl;
    const movieListUrl = form.dataset.movieListUrl;

    initMovieCreatePage();

    async function initMovieCreatePage() {
        clearErrors();

        const authorResult = await loadSelectOptions(authorSelect, "authors");
        const genreResult = await loadSelectOptions(genreSelect, "genres");

        if (!authorResult.success || !genreResult.success) {
            showErrorMessage("Some options could not be loaded.");
        }

        bindMovieCreateForm();
    }

    async function loadSelectOptions(selectElement, collectionName) {
        if (!selectElement) {
            return { success: false };
        }

        const apiUrl = selectElement.dataset.apiUrl;

        if (!apiUrl) {
            return { success: false };
        }

        setSelectLoadingState(selectElement, "Loading...");

        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json",
                },
            });

            const data = await parseJsonResponse(response);

            if (!response.ok) {
                setSelectLoadingState(selectElement, "Could not load options");
                return { success: false };
            }

            const items = normalizeCollectionResponse(data, collectionName);

            if (!items.length) {
                setSelectLoadingState(selectElement, "No options available");
                return { success: true };
            }

            selectElement.innerHTML = "";

            items.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = getOptionLabel(item);
                selectElement.appendChild(option);
            });

            return { success: true };
        } catch (error) {
            setSelectLoadingState(selectElement, "Could not load options");
            console.error(`Failed to load ${collectionName}:`, error);
            return { success: false };
        }
    }

    function normalizeCollectionResponse(data, collectionName) {
        if (Array.isArray(data)) {
            return data;
        }

        if (!data || typeof data !== "object") {
            return [];
        }

        if (Array.isArray(data.results)) {
            return data.results;
        }

        if (Array.isArray(data[collectionName])) {
            return data[collectionName];
        }

        if (Array.isArray(data.items)) {
            return data.items;
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    }

    function setSelectLoadingState(selectElement, text) {
        selectElement.innerHTML = "";

        const option = document.createElement("option");
        option.value = "";
        option.textContent = text;
        option.disabled = true;

        selectElement.appendChild(option);
    }

    function getOptionLabel(item) {
        if (!item || typeof item !== "object") {
            return "Unknown option";
        }

        if (item.name) {
            return item.name;
        }

        if (item.title) {
            return item.title;
        }

        if (item.full_name) {
            return item.full_name;
        }

        if (item.first_name || item.last_name) {
            return `${item.first_name || ""} ${item.last_name || ""}`.trim();
        }

        if (item.username) {
            return item.username;
        }

        return `Item ${item.id}`;
    }

    function bindMovieCreateForm() {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            clearErrors();

            const payload = buildMoviePayload();

            try {
                const response = await fetch(createApiUrl, {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "X-CSRFToken": getCsrfToken(),
                    },
                    body: JSON.stringify(payload),
                });

                const data = await parseJsonResponse(response);

                if (!response.ok) {
                    showApiErrors(data);
                    return;
                }

                window.location.href = movieListUrl;
            } catch (error) {
                showErrorMessage("Could not create the movie.");
                console.error("Movie create failed:", error);
            }
        });
    }

    function buildMoviePayload() {
        return {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            release_year: releaseYearInput.value ? Number(releaseYearInput.value) : null,
            author_ids: getSelectedValues(authorSelect),
            genre_ids: getSelectedValues(genreSelect),
        };
    }

    function getSelectedValues(selectElement) {
        if (!selectElement) {
            return [];
        }

        return Array.from(selectElement.selectedOptions)
            .map((option) => Number(option.value))
            .filter((value) => !Number.isNaN(value));
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
            showErrorMessage("Invalid movie data.");
            return;
        }

        const errors = data.errors || data;

        if (typeof errors === "string") {
            showErrorMessage(errors);
            return;
        }

        const messages = [];

        Object.entries(errors).forEach(([field, fieldErrors]) => {
            if (Array.isArray(fieldErrors)) {
                messages.push(`${field}: ${fieldErrors.join(" ")}`);
                return;
            }

            if (typeof fieldErrors === "object" && fieldErrors !== null) {
                messages.push(`${field}: ${JSON.stringify(fieldErrors)}`);
                return;
            }

            messages.push(`${field}: ${fieldErrors}`);
        });

        showErrorMessage(messages.join(" "));
    }

    function showErrorMessage(message) {
        if (!errorBox) {
            return;
        }

        errorBox.textContent = message;
        errorBox.style.display = "block";
    }

    function clearErrors() {
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