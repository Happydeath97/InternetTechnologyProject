document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("movie-update-form");

    if (!form) {
        return;
    }

    const titleInput = document.getElementById("id_title");
    const descriptionInput = document.getElementById("id_description");
    const releaseYearInput = document.getElementById("id_release_year");
    const authorSelect = document.getElementById("id_author");
    const genreSelect = document.getElementById("id_genre");
    const errorBox = document.getElementById("movie-update-errors");

    const detailApiUrl = form.dataset.detailApiUrl;
    const updateApiUrl = form.dataset.updateApiUrl;
    const movieDetailUrl = form.dataset.movieDetailUrl;

    initMovieUpdatePage();

    async function initMovieUpdatePage() {
        clearErrors();

        let movie = null;

        try {
            movie = await fetchMovieDetail();
            fillBasicMovieFields(movie);
        } catch (error) {
            showErrorMessage("Could not load the movie details.");
            console.error("Movie detail loading failed:", error);
            return;
        }

        const authorResult = await loadSelectOptions(authorSelect, "authors");
        const genreResult = await loadSelectOptions(genreSelect, "genres");

        if (!authorResult.success || !genreResult.success) {
            showErrorMessage("Movie data loaded, but some options could not be loaded.");
        }

        preselectMovieRelations(movie);
        bindMovieUpdateForm();
    }

    async function fetchMovieDetail() {
        const response = await fetch(detailApiUrl, {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
            },
        });

        const data = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error("Failed to load movie detail.");
        }

        if (data && data.movie) {
            return data.movie;
        }

        return data;
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

    function fillBasicMovieFields(movie) {
        titleInput.value = movie.title || "";
        descriptionInput.value = movie.description || "";
        releaseYearInput.value = movie.release_year || movie.year || "";
    }

    function preselectMovieRelations(movie) {
        const authorValues = extractRelationValues(movie, [
            "author",
            "authors",
            "author_ids",
            "author_id",
        ]);

        const genreValues = extractRelationValues(movie, [
            "genre",
            "genres",
            "genre_ids",
            "genre_id",
        ]);

        setSelectedOptions(authorSelect, authorValues);
        setSelectedOptions(genreSelect, genreValues);
    }

    function extractRelationValues(sourceObject, possibleFieldNames) {
        for (const fieldName of possibleFieldNames) {
            if (sourceObject[fieldName] !== undefined && sourceObject[fieldName] !== null) {
                return normalizeRelationValue(sourceObject[fieldName]);
            }
        }

        return [];
    }

    function normalizeRelationValue(value) {
        if (!value) {
            return [];
        }

        if (Array.isArray(value)) {
            return value
                .flatMap((item) => normalizeRelationValue(item))
                .filter((item) => item !== "");
        }

        if (typeof value === "object") {
            const possibleValues = [];

            if (value.id !== undefined && value.id !== null) {
                possibleValues.push(String(value.id));
            }

            if (value.name) {
                possibleValues.push(value.name);
            }

            if (value.title) {
                possibleValues.push(value.title);
            }

            if (value.full_name) {
                possibleValues.push(value.full_name);
            }

            if (value.first_name || value.last_name) {
                possibleValues.push(`${value.first_name || ""} ${value.last_name || ""}`.trim());
            }

            return possibleValues;
        }

        return [String(value)];
    }

    function setSelectedOptions(selectElement, selectedValues) {
        if (!selectElement) {
            return;
        }

        const normalizedSelectedValues = selectedValues.map((value) => normalizeText(value));

        Array.from(selectElement.options).forEach((option) => {
            const normalizedOptionValue = normalizeText(option.value);
            const normalizedOptionText = normalizeText(option.textContent);

            option.selected =
                normalizedSelectedValues.includes(normalizedOptionValue) ||
                normalizedSelectedValues.includes(normalizedOptionText);
        });
    }

    function normalizeText(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    function bindMovieUpdateForm() {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            clearErrors();

            const payload = buildMoviePayload();

            try {
                const response = await fetch(updateApiUrl, {
                    method: "PATCH",
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

                window.location.href = movieDetailUrl;
            } catch (error) {
                showErrorMessage("Could not update the movie.");
                console.error("Movie update failed:", error);
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

        if (typeof data === "string") {
            showErrorMessage(data);
            return;
        }

        const messages = [];

        Object.entries(data).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
                messages.push(`${field}: ${errors.join(" ")}`);
                return;
            }

            if (typeof errors === "object" && errors !== null) {
                messages.push(`${field}: ${JSON.stringify(errors)}`);
                return;
            }

            messages.push(`${field}: ${errors}`);
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