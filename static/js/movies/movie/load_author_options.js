document.addEventListener("DOMContentLoaded", loadAuthorOptions);

async function loadAuthorOptions() {
    const select = document.getElementById("id_author");

    if (!select) {
        document.dispatchEvent(new CustomEvent("authorsLoaded", {
            detail: { success: false }
        }));
        return;
    }

    const apiUrl = select.dataset.apiUrl;

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        const authors = data.authors || [];

        if (!authors.length) {
            select.innerHTML = `<option disabled>No authors available</option>`;
        } else {
            select.innerHTML = authors
                .map(author => `<option value="${author.id}">${escapeHtml(author.full_name)}</option>`)
                .join("");
        }

        document.dispatchEvent(new CustomEvent("authorsLoaded", {
            detail: { success: true }
        }));
    } catch (error) {
        select.innerHTML = `<option disabled>Failed to load authors</option>`;
        console.error("Failed to load authors:", error);

        document.dispatchEvent(new CustomEvent("authorsLoaded", {
            detail: { success: false, error }
        }));
    }
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}