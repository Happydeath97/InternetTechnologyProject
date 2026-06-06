document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("report-management-page");
    if (!page) {
        return;
    }
    const reportList = document.getElementById("report-list");
    const reportCount = document.getElementById("report-count");
    const reportSearch = document.getElementById("report-search");
    const errorBox = document.getElementById("report-error-box");
    const reportTypeFilter = document.getElementById("report-type-filter");
    const reportStatusFilter = document.getElementById("report-status-filter");
    const reportSort = document.getElementById("report-sort");
    const reportTimeSlider = document.getElementById("report-time-slider");
    const reportTimeFilterText = document.getElementById("report-time-filter-text");
    const reportModal = document.getElementById("report-modal");
    const reportModalBackdrop = document.getElementById("report-modal-backdrop");
    const reportModalCloseButton = document.getElementById("report-modal-close-button");
    const reportModalCancelButton = document.getElementById("report-modal-cancel-button");
    const reportModalSaveButton = document.getElementById("report-modal-save-button");
    const reportModalType = document.getElementById("report-modal-type");
    const reportModalTitle = document.getElementById("report-modal-title");
    const reportModalStatusSelect = document.getElementById("report-modal-status-select");
    const reportModalReason = document.getElementById("report-modal-reason");
    const reportModalMeta = document.getElementById("report-modal-meta");
    const reportModalTargetHeading = document.getElementById("report-modal-target-heading");
    const reportModalTargetContent = document.getElementById("report-modal-target-content");
    const reportModalCommentActions = document.getElementById("report-modal-comment-actions");
    const reportModalDeleteComment = document.getElementById("report-modal-delete-comment");
    const reportModalBanUser = document.getElementById("report-modal-ban-user");
    const reportModalErrorBox = document.getElementById("report-modal-error-box");
    const reportsApiUrl = page.dataset.reportsApiUrl;
    const reportDetailApiUrlTemplate = page.dataset.reportDetailApiUrlTemplate;
    const commentDetailApiUrlTemplate = page.dataset.commentDetailApiUrlTemplate;
    const movieDetailUrlTemplate = page.dataset.movieDetailUrlTemplate;
    const movieDetailApiUrlTemplate = page.dataset.movieDetailApiUrlTemplate;
    const authorApiUrl = page.dataset.authorApiUrl;
    const genreApiUrl = page.dataset.genreApiUrl;
    const canDelete = page.dataset.canDelete === "true";
    const banApiUrl = page.dataset.banApiUrl;
    let reports = [];
    let activeReport = null;
    let activeMovieOriginal = null;
    let activeMovieFormFields = null;
    let activeMovieCanEdit = false;
    let activeMovieFormLoaded = false;
    let lastFocusedElementBeforeModal = null;
    initReportListPage();
    async function initReportListPage() {
        clearError();
        hideReportModal();
        setupFilterListeners();
        setupModalListeners();
        await loadReports();
    }
    function setupFilterListeners() {
        if (reportSearch) {
            reportSearch.addEventListener("input", renderReports);
        }
        if (reportTypeFilter) {
            reportTypeFilter.addEventListener("change", renderReports);
        }
        if (reportStatusFilter) {
            reportStatusFilter.addEventListener("change", renderReports);
        }
        if (reportSort) {
            reportSort.addEventListener("change", renderReports);
        }
        if (reportTimeSlider) {
            reportTimeSlider.addEventListener("input", () => {
                updateTimeFilterText();
                renderReports();
            });
        }
    }
    function setupModalListeners() {
        if (reportModalBackdrop) {
            reportModalBackdrop.addEventListener("click", closeReportModal);
        }
        if (reportModalCloseButton) {
            reportModalCloseButton.addEventListener("click", closeReportModal);
        }
        if (reportModalCancelButton) {
            reportModalCancelButton.addEventListener("click", closeReportModal);
        }
        if (reportModalSaveButton) {
            reportModalSaveButton.addEventListener("click", handleApplyActions);
        }
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isReportModalOpen()) {
                closeReportModal();
            }
        });
    }
    async function loadReports() {
        try {
            const response = await fetch(reportsApiUrl, {
                method: "GET",
                credentials: "same-origin",
                headers: { Accept: "application/json" },
            });
            const data = await parseJsonResponse(response);
            if (!response.ok) {
                showApiErrors(data);
                return;
            }
            reports = Array.isArray(data.reports) ? data.reports : [];
            resetTimeSlider();
            renderReports();
        } catch (error) {
            console.error("Report loading failed:", error);
            showError("Could not load reports.");
        }
    }
    function renderReports() {
        if (!reportList) {
            return;
        }
        let filteredReports = [...reports];
        filteredReports = applySearchFilter(filteredReports);
        filteredReports = applyTypeFilter(filteredReports);
        filteredReports = applyStatusFilter(filteredReports);
        filteredReports = applyTimeFilter(filteredReports);
        filteredReports = applySort(filteredReports);
        updateReportCount(filteredReports.length);
        if (!filteredReports.length) {
            reportList.innerHTML = `<p class="report-empty-state">No reports found.</p>`;
            return;
        }
        reportList.innerHTML = "";
        filteredReports.forEach((report) => {
            reportList.appendChild(createReportRow(report));
        });
    }
    function applySearchFilter(items) {
        const searchValue = reportSearch ? reportSearch.value.trim().toLowerCase() : "";
        if (!searchValue) {
            return items;
        }
        return items.filter((report) => {
            return getReportSearchText(report).includes(searchValue);
        });
    }
    function applyTypeFilter(items) {
        const selectedType = reportTypeFilter ? reportTypeFilter.value : "";
        if (!selectedType) {
            return items;
        }
        return items.filter((report) => {
            if (selectedType === "movie") {
                return Boolean(report.movie);
            }
            if (selectedType === "comment") {
                return Boolean(report.comment);
            }
            return true;
        });
    }
    function applyStatusFilter(items) {
        const selectedStatus = reportStatusFilter ? reportStatusFilter.value : "";
        if (!selectedStatus) {
            return items;
        }
        return items.filter((report) => {
            return report.status === selectedStatus;
        });
    }
    function applyTimeFilter(items) {
        const threshold = getTimeThreshold();
        if (threshold === null) {
            return items;
        }
        return items.filter((report) => {
            const timestamp = getReportTimestamp(report);
            return timestamp !== null && timestamp >= threshold;
        });
    }
    function applySort(items) {
        const sortValue = reportSort ? reportSort.value : "newest";
        return [...items].sort((a, b) => {
            if (sortValue === "oldest") {
                return compareByTime(a, b);
            }
            if (sortValue === "alphabet") {
                return getAlphabetText(a).localeCompare(getAlphabetText(b));
            }
            return compareByTime(b, a);
        });
    }
    function createReportRow(report) {
        const row = document.createElement("div");
        row.className = "report-row";
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.setAttribute("aria-label", `Open ${getReportTitle(report)}`);
        row.addEventListener("click", () => {
            openReportModal(report, row);
        });
        row.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openReportModal(report, row);
            }
        });
        const main = document.createElement("div");
        main.className = "report-main";
        const topLine = document.createElement("div");
        topLine.className = "report-top-line";
        const title = document.createElement("div");
        title.className = "report-title";
        title.textContent = getReportTitle(report);
        const status = document.createElement("span");
        status.className = `report-status report-status-${slugify(report.status)}`;
        status.textContent = report.status || "UNKNOWN";
        topLine.appendChild(title);
        topLine.appendChild(status);
        const reason = document.createElement("div");
        reason.className = "report-reason";
        reason.textContent = report.reason || "No reason provided.";
        const meta = document.createElement("div");
        meta.className = "report-meta";
        meta.textContent = getReportMeta(report);
        main.appendChild(topLine);
        main.appendChild(reason);
        if (meta.textContent) {
            main.appendChild(meta);
        }
        const actions = document.createElement("div");
        actions.className = "report-target";
        const targetText = document.createElement("div");
        targetText.className = "report-target-text";
        targetText.textContent = getReportTargetText(report);
        actions.appendChild(targetText);
        const movieUrl = getMovieUrl(report);
        if (movieUrl) {
            const openMovieLink = document.createElement("a");
            openMovieLink.className = "report-action-button report-open-button";
            openMovieLink.href = movieUrl;
            openMovieLink.target = "_blank";
            openMovieLink.rel = "noopener noreferrer";
            openMovieLink.textContent = "Open Movie";
            openMovieLink.addEventListener("click", (event) => {
                event.stopPropagation();
            });
            actions.appendChild(openMovieLink);
        }
        if (canDelete && report.can_delete) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "report-action-button report-delete-button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", (event) => {
                event.stopPropagation();
                deleteReport(report);
            });
            actions.appendChild(deleteButton);
        }
        row.appendChild(main);
        row.appendChild(actions);
        return row;
    }
    function openReportModal(report, triggerElement) {
        if (!reportModal) {
            return;
        }
        activeReport = report;
        lastFocusedElementBeforeModal = triggerElement || document.activeElement;
        clearModalError();
        resetModalForm();
        populateReportModal(report);
        reportModal.hidden = false;
        reportModal.classList.add("active");
        reportModal.setAttribute("aria-hidden", "false");
        if (reportModalStatusSelect) {
            reportModalStatusSelect.focus();
        }
    }
    function closeReportModal() {
        activeReport = null;
        moveFocusOutOfModal();
        hideReportModal();
    }
    function moveFocusOutOfModal() {
        if (!reportModal || !reportModal.contains(document.activeElement)) {
            return;
        }
        if (
            lastFocusedElementBeforeModal &&
            document.contains(lastFocusedElementBeforeModal) &&
            typeof lastFocusedElementBeforeModal.focus === "function"
        ) {
            lastFocusedElementBeforeModal.focus({ preventScroll: true });
            return;
        }
        document.activeElement.blur();
    }
    function hideReportModal() {
        if (!reportModal) {
            return;
        }
        hideCommentActions();
        resetMovieFormState();
        setSaveButtonBusy(false);
        reportModal.classList.remove("active");
        reportModal.setAttribute("aria-hidden", "true");
        reportModal.hidden = true;
    }
    function isReportModalOpen() {
        return reportModal && !reportModal.hidden;
    }
    function resetModalForm() {
        if (reportModalStatusSelect) {
            reportModalStatusSelect.value = "PENDING";
        }
        if (reportModalReason) {
            reportModalReason.textContent = "";
        }
        if (reportModalMeta) {
            reportModalMeta.textContent = "";
        }
        if (reportModalTargetContent) {
            reportModalTargetContent.innerHTML = "";
        }
        hideCommentActions();
        resetMovieFormState();
    }
    function resetMovieFormState() {
        activeMovieOriginal = null;
        activeMovieFormFields = null;
        activeMovieCanEdit = false;
        activeMovieFormLoaded = false;
    }
    function populateReportModal(report) {
        if (reportModalType) {
            reportModalType.textContent = getModalTypeText(report);
        }
        if (reportModalTitle) {
            reportModalTitle.textContent = getReportTitle(report);
        }
        if (reportModalStatusSelect) {
            reportModalStatusSelect.value = report.status || "PENDING";
        }
        if (reportModalReason) {
            reportModalReason.textContent = report.reason || "No reason provided.";
        }
        if (reportModalMeta) {
            reportModalMeta.textContent = getReportMeta(report) || "No metadata available.";
        }
        if (report.movie) {
            populateMovieReportModal(report);
            return;
        }
        if (report.comment) {
            populateCommentReportModal(report);
            return;
        }
        populateUnknownReportModal();
    }
    async function populateMovieReportModal(report) {
        hideCommentActions();
        resetMovieFormState();
        if (reportModalTargetHeading) {
            reportModalTargetHeading.textContent = "Reported movie";
        }
        if (!reportModalTargetContent) {
            return;
        }
        reportModalTargetContent.innerHTML = `<p class="report-modal-help-text">Loading movie edit form...</p>`;
        if (!report.movie || !report.movie.id) {
            reportModalTargetContent.innerHTML = `<p class="report-modal-help-text">Could not identify the reported movie.</p>`;
            return;
        }
        try {
            const movieDetailData = await fetchMovieDetailForModal(report.movie.id);
            if (activeReport !== report) {
                return;
            }
            const movie = movieDetailData.movie || movieDetailData;
            const permissions = movieDetailData.permissions || {};
            activeMovieOriginal = movie;
            activeMovieCanEdit = permissions.can_edit_movie !== false;
            reportModalTargetContent.innerHTML = "";
            if (!activeMovieCanEdit) {
                showMovieReadonlyBox(movie, "You do not have permission to edit this movie.");
                activeMovieFormLoaded = true;
                return;
            }
            const form = createMovieEditForm();
            reportModalTargetContent.appendChild(form);
            fillMovieFormFields(movie);
            const authorResult = await loadSelectOptionsFromApi(
                activeMovieFormFields.authorSelect,
                authorApiUrl,
                "authors"
            );
            const genreResult = await loadSelectOptionsFromApi(
                activeMovieFormFields.genreSelect,
                genreApiUrl,
                "genres"
            );
            if (!authorResult.success || !genreResult.success) {
                showModalError("Movie data loaded, but some author or genre options could not be loaded.");
            }
            preselectModalMovieRelations(movie);
            activeMovieFormLoaded = true;
        } catch (error) {
            console.error("Movie modal form loading failed:", error);
            reportModalTargetContent.innerHTML = "";
            showMovieReadonlyBox(report.movie, "Could not load the movie edit form.");
            showModalError("Could not load the movie edit form.");
        }
    }
    function createMovieEditForm() {
        const form = document.createElement("form");
        form.className = "report-modal-movie-form";
        form.addEventListener("submit", (event) => {
            event.preventDefault();
        });
        const titleGroup = document.createElement("div");
        titleGroup.className = "report-modal-form-group";
        const titleLabel = document.createElement("label");
        titleLabel.setAttribute("for", "report-modal-movie-title");
        titleLabel.textContent = "Title";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.id = "report-modal-movie-title";
        titleInput.className = "report-modal-form-control";
        titleInput.required = true;
        titleGroup.appendChild(titleLabel);
        titleGroup.appendChild(titleInput);
        const descriptionGroup = document.createElement("div");
        descriptionGroup.className = "report-modal-form-group";
        const descriptionLabel = document.createElement("label");
        descriptionLabel.setAttribute("for", "report-modal-movie-description");
        descriptionLabel.textContent = "Description";
        const descriptionInput = document.createElement("textarea");
        descriptionInput.id = "report-modal-movie-description";
        descriptionInput.className = "report-modal-form-control report-modal-form-textarea";
        descriptionInput.rows = 6;
        descriptionGroup.appendChild(descriptionLabel);
        descriptionGroup.appendChild(descriptionInput);
        const releaseYearGroup = document.createElement("div");
        releaseYearGroup.className = "report-modal-form-group";
        const releaseYearLabel = document.createElement("label");
        releaseYearLabel.setAttribute("for", "report-modal-movie-release-year");
        releaseYearLabel.textContent = "Release year";
        const releaseYearInput = document.createElement("input");
        releaseYearInput.type = "number";
        releaseYearInput.id = "report-modal-movie-release-year";
        releaseYearInput.className = "report-modal-form-control";
        releaseYearInput.min = "1888";
        releaseYearInput.max = "2100";
        releaseYearGroup.appendChild(releaseYearLabel);
        releaseYearGroup.appendChild(releaseYearInput);
        const relationGrid = document.createElement("div");
        relationGrid.className = "report-modal-form-grid";
        const authorGroup = document.createElement("div");
        authorGroup.className = "report-modal-form-group";
        const authorLabel = document.createElement("label");
        authorLabel.setAttribute("for", "report-modal-movie-authors");
        authorLabel.textContent = "Authors";
        const authorSelect = document.createElement("select");
        authorSelect.id = "report-modal-movie-authors";
        authorSelect.className = "report-modal-form-control report-modal-form-select";
        authorSelect.multiple = true;
        const authorHelp = document.createElement("p");
        authorHelp.className = "report-modal-form-help";
        authorHelp.textContent = "Hold Ctrl/Cmd to select multiple authors.";
        authorGroup.appendChild(authorLabel);
        authorGroup.appendChild(authorSelect);
        authorGroup.appendChild(authorHelp);
        const genreGroup = document.createElement("div");
        genreGroup.className = "report-modal-form-group";
        const genreLabel = document.createElement("label");
        genreLabel.setAttribute("for", "report-modal-movie-genres");
        genreLabel.textContent = "Genres";
        const genreSelect = document.createElement("select");
        genreSelect.id = "report-modal-movie-genres";
        genreSelect.className = "report-modal-form-control report-modal-form-select";
        genreSelect.multiple = true;
        const genreHelp = document.createElement("p");
        genreHelp.className = "report-modal-form-help";
        genreHelp.textContent = "Hold Ctrl/Cmd to select multiple genres.";
        genreGroup.appendChild(genreLabel);
        genreGroup.appendChild(genreSelect);
        genreGroup.appendChild(genreHelp);
        relationGrid.appendChild(authorGroup);
        relationGrid.appendChild(genreGroup);
        form.appendChild(titleGroup);
        form.appendChild(descriptionGroup);
        form.appendChild(releaseYearGroup);
        form.appendChild(relationGrid);
        activeMovieFormFields = { titleInput, descriptionInput, releaseYearInput, authorSelect, genreSelect };
        return form;
    }
    function showMovieReadonlyBox(movie, message) {
        if (!reportModalTargetContent) {
            return;
        }
        const movieBox = document.createElement("div");
        movieBox.className = "report-modal-target-box";
        const title = document.createElement("h4");
        title.textContent = movie.title || `Movie #${movie.id}`;
        const idText = document.createElement("p");
        idText.textContent = movie.id ? `Movie ID: ${movie.id}` : "Movie ID unavailable";
        const note = document.createElement("p");
        note.className = "report-modal-help-text";
        note.textContent = message;
        movieBox.appendChild(title);
        movieBox.appendChild(idText);
        movieBox.appendChild(note);
        reportModalTargetContent.appendChild(movieBox);
    }
    function fillMovieFormFields(movie) {
        if (!activeMovieFormFields) {
            return;
        }
        activeMovieFormFields.titleInput.value = movie.title || "";
        activeMovieFormFields.descriptionInput.value = movie.description || "";
        activeMovieFormFields.releaseYearInput.value = movie.release_year || movie.year || "";
    }
    async function fetchMovieDetailForModal(movieId) {
        if (!movieDetailApiUrlTemplate) {
            throw new Error("Movie detail API URL is missing.");
        }
        const response = await fetch(buildUrlFromTemplate(movieDetailApiUrlTemplate, movieId), {
            method: "GET",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
        });
        const data = await parseJsonResponse(response);
        if (!response.ok) {
            throw new Error(getApiErrorText(data, "Failed to load movie detail."));
        }
        return data;
    }
    async function loadSelectOptionsFromApi(selectElement, apiUrl, collectionName) {
        if (!selectElement || !apiUrl) {
            return { success: false };
        }
        setSelectLoadingState(selectElement, "Loading...");
        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                credentials: "same-origin",
                headers: { Accept: "application/json" },
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
            console.error(`Failed to load ${collectionName}:`, error);
            setSelectLoadingState(selectElement, "Could not load options");
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
    function preselectModalMovieRelations(movie) {
        if (!activeMovieFormFields) {
            return;
        }
        const authorValues = extractRelationValues(movie, ["author", "authors", "author_ids", "author_id"]);
        const genreValues = extractRelationValues(movie, ["genre", "genres", "genre_ids", "genre_id"]);
        setSelectedOptions(activeMovieFormFields.authorSelect, authorValues);
        setSelectedOptions(activeMovieFormFields.genreSelect, genreValues);
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
            return value.flatMap((item) => normalizeRelationValue(item)).filter((item) => item !== "");
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
    function populateCommentReportModal(report) {
        showCommentActions();
        if (reportModalTargetHeading) {
            reportModalTargetHeading.textContent = "Reported comment";
        }
        if (!reportModalTargetContent) {
            return;
        }
        const commentBox = document.createElement("div");
        commentBox.className = "report-modal-comment-preview";
        const commentMeta = document.createElement("div");
        commentMeta.className = "report-modal-comment-meta";
        commentMeta.textContent = getCommentModalMeta(report);
        const commentContent = document.createElement("p");
        commentContent.className = "report-modal-comment-content";
        commentContent.textContent = report.comment.content || "No comment content available.";
        commentBox.appendChild(commentMeta);
        commentBox.appendChild(commentContent);
        reportModalTargetContent.appendChild(commentBox);
    }
    function populateUnknownReportModal() {
        hideCommentActions();
        if (reportModalTargetHeading) {
            reportModalTargetHeading.textContent = "Unknown target";
        }
        if (!reportModalTargetContent) {
            return;
        }
        const unknownText = document.createElement("p");
        unknownText.className = "report-modal-help-text";
        unknownText.textContent = "This report does not have a movie or comment target.";
        reportModalTargetContent.appendChild(unknownText);
    }
    function showCommentActions() {
        if (reportModalCommentActions) {
            reportModalCommentActions.hidden = false;
            reportModalCommentActions.style.display = "";
        }
        if (reportModalDeleteComment) {
            reportModalDeleteComment.disabled = false;
        }
        if (reportModalBanUser) {
            reportModalBanUser.disabled = false;
        }
    }
    function hideCommentActions() {
        if (reportModalCommentActions) {
            reportModalCommentActions.hidden = true;
            reportModalCommentActions.style.display = "none";
        }
        if (reportModalDeleteComment) {
            reportModalDeleteComment.checked = false;
            reportModalDeleteComment.disabled = true;
        }
        if (reportModalBanUser) {
            reportModalBanUser.checked = false;
            reportModalBanUser.disabled = true;
        }
    }
    async function handleApplyActions() {
        if (!activeReport) {
            return;
        }
        clearModalError();
        setSaveButtonBusy(true);
        try {
            let actionResult = { removed: false };
            if (activeReport.comment) {
                actionResult = await handleCommentReportApply();
            }
            if (actionResult.removed) {
                renderReports();
                closeReportModal();
                return;
            }
            if (activeReport.movie) {
                await handleMovieReportApply();
            }
            replaceReportInList(activeReport);
            renderReports();
            closeReportModal();
        } catch (error) {
            console.error("Apply report actions failed:", error);
            showModalError(error.message || "Could not apply report actions.");
        } finally {
            setSaveButtonBusy(false);
        }
    }

    async function createBanForReportedComment(report) {
        if (!banApiUrl) {
            throw new Error("Ban API URL is missing.");
        }

        const userId = getReportedCommentUserId(report);

        if (!userId) {
            throw new Error("Cannot ban this user because the report comment data does not include user_id.");
        }

        const payload = {
            user_id: userId,
            reason: buildBanReason(report),
            is_permanent: true,
            status: "active",
        };

        const response = await fetch(banApiUrl, {
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
            throw new Error(getApiErrorText(data, "Could not ban the reported user."));
        }

        return data;
    }
    function getReportedCommentUserId(report) {
        if (!report || !report.comment) {
            return null;
        }

        if (report.comment.user_id) {
            return report.comment.user_id;
        }

        if (report.comment.user && typeof report.comment.user === "object" && report.comment.user.id) {
            return report.comment.user.id;
        }

        return null;
    }
    function buildBanReason(report) {
        const reportId = report && report.id ? `Report #${report.id}` : "Report";
        const reason = report && report.reason ? report.reason : "Reported comment violation.";

        return `${reportId}: ${reason}`;
    }

    async function handleCommentReportApply() {
    const shouldDeleteComment = reportModalDeleteComment && reportModalDeleteComment.checked;
    const shouldBanUser = reportModalBanUser && reportModalBanUser.checked;

    if (shouldBanUser) {
        await createBanForReportedComment(activeReport);
    }

    if (shouldDeleteComment) {
        const confirmed = window.confirm(
            "Delete the reported comment? This will also remove this report from the moderation list."
        );

        if (!confirmed) {
            return { removed: false };
        }

        await deleteComment(activeReport.comment.id);
        removeReportFromList(activeReport.id);

        return { removed: true };
    }

    const selectedStatus = getSelectedModalStatus();

    if (selectedStatus && selectedStatus !== activeReport.status) {
        const reportData = await patchReportStatus(activeReport.id, selectedStatus);
        activeReport = reportData.report || reportData;
    }

    return { removed: false };
}
    async function handleMovieReportApply() {
        if (activeMovieCanEdit) {
            if (!activeMovieFormLoaded || !activeMovieFormFields) {
                throw new Error("Movie edit form is still loading.");
            }
            const moviePayload = buildModalMoviePayload();
            if (hasMoviePayloadChanged(moviePayload, activeMovieOriginal)) {
                const movieData = await patchMovie(activeReport.movie.id, moviePayload);
                const updatedMovie = movieData.movie || movieData;
                activeMovieOriginal = updatedMovie;
                activeReport.movie = { id: updatedMovie.id, title: updatedMovie.title };
            }
        }
        const selectedStatus = getSelectedModalStatus();
        if (selectedStatus && selectedStatus !== activeReport.status) {
            const reportData = await patchReportStatus(activeReport.id, selectedStatus);
            activeReport = reportData.report || reportData;
        }
    }
    function getSelectedModalStatus() {
        if (!reportModalStatusSelect) {
            return activeReport ? activeReport.status : "";
        }
        return reportModalStatusSelect.value;
    }
    function buildModalMoviePayload() {
        return {
            title: activeMovieFormFields.titleInput.value.trim(),
            description: activeMovieFormFields.descriptionInput.value.trim(),
            release_year: activeMovieFormFields.releaseYearInput.value
                ? Number(activeMovieFormFields.releaseYearInput.value)
                : null,
            author_ids: getSelectedValues(activeMovieFormFields.authorSelect),
            genre_ids: getSelectedValues(activeMovieFormFields.genreSelect),
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
    function hasMoviePayloadChanged(payload, originalMovie) {
        if (!originalMovie) {
            return true;
        }
        const originalPayload = {
            title: originalMovie.title || "",
            description: originalMovie.description || "",
            release_year: originalMovie.release_year || originalMovie.year || null,
            author_ids: extractRelationIds(originalMovie.authors || originalMovie.author),
            genre_ids: extractRelationIds(originalMovie.genres || originalMovie.genre),
        };
        return (
            payload.title !== originalPayload.title ||
            payload.description !== originalPayload.description ||
            Number(payload.release_year) !== Number(originalPayload.release_year) ||
            !arraysEqualSorted(payload.author_ids, originalPayload.author_ids) ||
            !arraysEqualSorted(payload.genre_ids, originalPayload.genre_ids)
        );
    }
    function extractRelationIds(value) {
        if (!value) {
            return [];
        }
        if (Array.isArray(value)) {
            return value
                .map((item) => {
                    if (typeof item === "object" && item !== null) {
                        return Number(item.id);
                    }
                    return Number(item);
                })
                .filter((item) => !Number.isNaN(item));
        }
        if (typeof value === "object" && value.id !== undefined) {
            const id = Number(value.id);
            return Number.isNaN(id) ? [] : [id];
        }
        const id = Number(value);
        return Number.isNaN(id) ? [] : [id];
    }
    function arraysEqualSorted(firstArray, secondArray) {
        const first = [...firstArray].sort((a, b) => a - b);
        const second = [...secondArray].sort((a, b) => a - b);
        if (first.length !== second.length) {
            return false;
        }
        return first.every((value, index) => value === second[index]);
    }
    async function patchMovie(movieId, payload) {
        if (!movieDetailApiUrlTemplate) {
            throw new Error("Movie detail API URL is missing.");
        }
        const response = await fetch(buildUrlFromTemplate(movieDetailApiUrlTemplate, movieId), {
            method: "PATCH",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRFToken": getCsrfToken() },
            body: JSON.stringify(payload),
        });
        const data = await parseJsonResponse(response);
        if (!response.ok) {
            throw new Error(getApiErrorText(data, "Could not update the movie."));
        }
        return data;
    }
    async function patchReportStatus(reportId, statusValue) {
        const response = await fetch(buildUrlFromTemplate(reportDetailApiUrlTemplate, reportId), {
            method: "PATCH",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRFToken": getCsrfToken() },
            body: JSON.stringify({ status: statusValue }),
        });
        const data = await parseJsonResponse(response);
        if (!response.ok) {
            throw new Error(getApiErrorText(data, "Could not update the report status."));
        }
        return data;
    }
    async function deleteComment(commentId) {
        if (!commentDetailApiUrlTemplate) {
            throw new Error("Comment detail API URL is missing.");
        }
        const response = await fetch(buildUrlFromTemplate(commentDetailApiUrlTemplate, commentId), {
            method: "DELETE",
            credentials: "same-origin",
            headers: { Accept: "application/json", "X-CSRFToken": getCsrfToken() },
        });
        const data = await parseJsonResponse(response);
        if (!response.ok) {
            throw new Error(getApiErrorText(data, "Could not delete the reported comment."));
        }
        return data;
    }
    function replaceReportInList(updatedReport) {
        if (!updatedReport || !updatedReport.id) {
            return;
        }
        reports = reports.map((report) => {
            if (report.id === updatedReport.id) {
                return updatedReport;
            }
            return report;
        });
    }
    function removeReportFromList(reportId) {
        reports = reports.filter((report) => report.id !== reportId);
    }

    function setSaveButtonBusy(isBusy) {
        if (!reportModalSaveButton) {
            return;
        }
        reportModalSaveButton.disabled = isBusy;
        reportModalSaveButton.textContent = isBusy ? "Applying..." : "Apply actions";
    }
    async function deleteReport(report) {
        const confirmed = window.confirm(`Delete report #${report.id}?`);
        if (!confirmed) {
            return;
        }
        clearError();
        try {
            const response = await fetch(buildUrlFromTemplate(reportDetailApiUrlTemplate, report.id), {
                method: "DELETE",
                credentials: "same-origin",
                headers: { Accept: "application/json", "X-CSRFToken": getCsrfToken() },
            });
            const data = await parseJsonResponse(response);
            if (!response.ok) {
                showApiErrors(data);
                return;
            }
            reports = reports.filter((item) => item.id !== report.id);
            resetTimeSlider();
            renderReports();
        } catch (error) {
            console.error("Report delete failed:", error);
            showError("Could not delete report.");
        }
    }
    function getReportTitle(report) {
        if (report.movie) {
            return `Movie report: ${report.movie.title}`;
        }
        if (report.comment) {
            return "Comment report";
        }
        return `Report #${report.id}`;
    }
    function getReportTargetText(report) {
        if (report.movie) {
            return `Movie: ${report.movie.title}`;
        }
        if (report.comment) {
            return `Comment #${report.comment.id}`;
        }
        return "Unknown target";
    }
    function getReportMeta(report) {
        const parts = [];
        if (report.user) {
            parts.push(`Reported by: ${report.user}`);
        }
        if (report.created_at) {
            parts.push(`Created: ${report.created_at}`);
        }
        if (report.reviewed_by) {
            parts.push(`Reviewed by: ${report.reviewed_by}`);
        }
        if (report.reviewed_at) {
            parts.push(`Reviewed: ${report.reviewed_at}`);
        }
        return parts.join(" • ");
    }

    function getCommentModalMeta(report) {
        const parts = [];

        if (report.comment && report.comment.user) {
            parts.push(report.comment.user);
        }

        if (report.comment && report.comment.created_at) {
            parts.push(report.comment.created_at);
        }

        if (report.comment && report.comment.movie_id) {
            parts.push(`Movie #${report.comment.movie_id}`);
        }

        if (report.comment && report.comment.id) {
            parts.push(`Comment #${report.comment.id}`);
        }

        return parts.join(" • ");
    }

    function getModalTypeText(report) {
        if (report.movie) {
            return "Movie report";
        }
        if (report.comment) {
            return "Comment report";
        }
        return "Report details";
    }
    function getMovieUrl(report) {
        const movieId = getMovieId(report);
        if (!movieId || !movieDetailUrlTemplate) {
            return "";
        }
        return buildUrlFromTemplate(movieDetailUrlTemplate, movieId);
    }
    function getMovieId(report) {
        if (report.movie && report.movie.id) {
            return report.movie.id;
        }
        if (report.comment && report.comment.movie_id) {
            return report.comment.movie_id;
        }
        return null;
    }
    function getReportSearchText(report) {
        return [
            report.id,
            report.user,
            report.reason,
            report.status,
            report.reviewed_by,
            report.created_at,
            report.reviewed_at,
            report.movie ? report.movie.title : "",
            report.comment ? report.comment.content : "",
        ]
            .join(" ")
            .toLowerCase();
    }
    function getAlphabetText(report) {
        if (report.movie) {
            return report.movie.title || "";
        }
        if (report.comment) {
            return report.comment.content || "";
        }
        return report.reason || "";
    }
    function compareByTime(a, b) {
        const timestampA = getReportTimestamp(a);
        const timestampB = getReportTimestamp(b);
        return (timestampA || 0) - (timestampB || 0);
    }
    function getReportTimestamp(report) {
        if (!report || !report.created_at) {
            return null;
        }
        const parsedDate = parseReportDate(report.created_at);
        if (!parsedDate) {
            return null;
        }
        return parsedDate.getTime();
    }
    function parseReportDate(value) {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
        if (!match) {
            const fallbackDate = new Date(value);
            if (Number.isNaN(fallbackDate.getTime())) {
                return null;
            }
            return fallbackDate;
        }
        const year = Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = Number(match[3]);
        const hour = Number(match[4]);
        const minute = Number(match[5]);
        return new Date(year, month, day, hour, minute);
    }
    function resetTimeSlider() {
        if (!reportTimeSlider) {
            return;
        }
        reportTimeSlider.value = "0";
        updateTimeFilterText();
    }
    function getTimeThreshold() {
        if (!reportTimeSlider) {
            return null;
        }
        const sliderValue = Number(reportTimeSlider.value);
        if (sliderValue <= 0) {
            return null;
        }
        const range = getReportTimeRange();
        if (!range) {
            return null;
        }
        const rawThreshold = range.min + (range.max - range.min) * (sliderValue / 100);
        const thresholdDate = new Date(rawThreshold);
        thresholdDate.setHours(0, 0, 0, 0);
        return thresholdDate.getTime();
    }
    function getReportTimeRange() {
        const timestamps = reports
            .map((report) => getReportTimestamp(report))
            .filter((timestamp) => timestamp !== null);
        if (timestamps.length < 2) {
            return null;
        }
        return { min: Math.min(...timestamps), max: Math.max(...timestamps) };
    }
    function updateTimeFilterText() {
        if (!reportTimeFilterText) {
            return;
        }
        const threshold = getTimeThreshold();
        if (threshold === null) {
            reportTimeFilterText.textContent = "From: oldest";
            return;
        }
        reportTimeFilterText.textContent = `From: ${formatDateOnly(threshold)}`;
    }
    function formatDateOnly(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }
    function buildUrlFromTemplate(template, id) {
        return template.replace("/0/", `/${id}/`);
    }
    function slugify(value) {
        if (!value) {
            return "unknown";
        }
        return value.toString().trim().toLowerCase().replace(/_/g, "-");
    }
    function updateReportCount(count) {
        if (!reportCount) {
            return;
        }
        reportCount.textContent = count;
    }
    async function parseJsonResponse(response) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }
    function getApiErrorText(data, fallbackMessage) {
        if (!data) {
            return fallbackMessage || "Request failed.";
        }
        const errors = data.errors || data.error || data;
        if (typeof errors === "string") {
            return errors;
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
        if (!messages.length) {
            return fallbackMessage || "Request failed.";
        }
        return messages.join(" ");
    }
    function showApiErrors(data) {
        showError(getApiErrorText(data, "Request failed."));
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
    function showModalError(message) {
        if (!reportModalErrorBox) {
            return;
        }
        reportModalErrorBox.textContent = message;
        reportModalErrorBox.style.display = "block";
    }
    function clearModalError() {
        if (!reportModalErrorBox) {
            return;
        }
        reportModalErrorBox.textContent = "";
        reportModalErrorBox.style.display = "none";
    }
    function getCsrfToken() {
        const csrfInput = document.querySelector("[name=csrfmiddlewaretoken]");
        if (csrfInput) {
            return csrfInput.value;
        }
        return "";
    }
});
