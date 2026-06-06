document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("author-management-page");

    if (!page) {
        return;
    }

    const authorList = document.getElementById("author-list");
    const authorCount = document.getElementById("author-count");
    const authorSearch = document.getElementById("author-search");
    const errorBox = document.getElementById("author-error-box");

    const authorsApiUrl = page.dataset.authorsApiUrl;
    const authorDetailApiUrlTemplate = page.dataset.authorDetailApiUrlTemplate;
    const authorUpdateUrlTemplate = page.dataset.authorUpdateUrlTemplate;

    const canChange = page.dataset.canChange === "true";
    const canDelete = page.dataset.canDelete === "true";

    let authors = [];

    initAuthorListPage();

    async function initAuthorListPage() {
        clearError();

        await loadAuthors();

        if (authorSearch) {
            authorSearch.addEventListener("input", () => {
                renderAuthors();
            });
        }
    }

    async function loadAuthors() {
        try {
            const response = await fetch(authorsApiUrl, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json",
                },
            });

            const data = await parseJsonResponse(response);

            if (!response.ok) {
                showError("Could not load authors.");
                return;
            }

            authors = Array.isArray(data.authors) ? data.authors : [];
            renderAuthors();
        } catch {
            showError("Could not load authors.");
        }
    }

    function renderAuthors() {
        if (!authorList) {
            return;
        }

        const searchValue = authorSearch ? authorSearch.value.trim().toLowerCase() : "";

        const filteredAuthors = authors.filter((author) => {
            return getAuthorName(author).toLowerCase().includes(searchValue);
        });

        updateAuthorCount(filteredAuthors.length);

        if (!filteredAuthors.length) {
            authorList.innerHTML = `<p class="author-empty-state">No authors found.</p>`;
            return;
        }

        authorList.innerHTML = "";

        filteredAuthors.forEach((author) => {
            authorList.appendChild(createAuthorRow(author));
        });
    }

    function createAuthorRow(author) {
        const row = document.createElement("div");
        row.className = "author-row";

        const main = document.createElement("div");
        main.className = "author-main";

        const name = document.createElement("div");
        name.className = "author-name";
        name.textContent = getAuthorName(author);

        const meta = document.createElement("div");
        meta.className = "author-meta";
        meta.textContent = getAuthorMeta(author);

        main.appendChild(name);

        if (meta.textContent) {
            main.appendChild(meta);
        }

        const actions = document.createElement("div");
        actions.className = "author-actions";

        if (canChange) {
            const editLink = document.createElement("a");
            editLink.className = "author-action-button author-edit-button";
            editLink.href = buildUrlFromTemplate(authorUpdateUrlTemplate, author.id);
            editLink.textContent = "Edit";
            actions.appendChild(editLink);
        }

        if (canDelete) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "author-action-button author-delete-button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteAuthor(author);
            });

            actions.appendChild(deleteButton);
        }

        row.appendChild(main);
        row.appendChild(actions);

        return row;
    }

    async function deleteAuthor(author) {
        const authorName = getAuthorName(author);

        const confirmed = window.confirm(`Delete author "${authorName}"?`);

        if (!confirmed) {
            return;
        }

        clearError();

        try {
            const response = await fetch(buildUrlFromTemplate(authorDetailApiUrlTemplate, author.id), {
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

            authors = authors.filter((item) => item.id !== author.id);
            renderAuthors();
        } catch {
            showError("Could not delete author.");
        }
    }

    function buildUrlFromTemplate(template, id) {
        return template.replace("/0/", `/${id}/`);
    }

    function getAuthorName(author) {
        if (!author) {
            return "Unknown author";
        }

        if (author.full_name) {
            return author.full_name;
        }

        if (author.name) {
            return author.name;
        }

        if (author.first_name || author.last_name) {
            return `${author.first_name || ""} ${author.last_name || ""}`.trim();
        }

        return `Author ${author.id}`;
    }

    function getAuthorMeta(author) {
        if (!author) {
            return "";
        }

        if (author.date_of_birth) {
            return `Born: ${author.date_of_birth}`;
        }

        return "";
    }

    function updateAuthorCount(count) {
        if (!authorCount) {
            return;
        }

        authorCount.textContent = count;
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

        Object.values(errors).forEach((fieldErrors) => {
            if (Array.isArray(fieldErrors)) {
                messages.push(fieldErrors.join(" "));
                return;
            }

            messages.push(fieldErrors);
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