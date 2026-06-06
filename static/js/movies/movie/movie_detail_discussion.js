const discussionPage = document.getElementById("movie-detail-page");

const discussionAuthPanel = document.getElementById("movie-discussion-auth-panel");
const commentsList = document.getElementById("movie-comments-list");
const discussionCommentCount = document.getElementById("discussion-comment-count");
const discussionReplyCount = document.getElementById("discussion-reply-count");

const discussionMovieId = discussionPage.dataset.movieId;
const discussionCommentsApiUrl = discussionPage.dataset.commentsApiUrl;
const discussionCanComment = discussionPage.dataset.canComment === "true";
const discussionLoginUrl = discussionPage.dataset.loginUrl;
const discussionRegisterUrl = discussionPage.dataset.registerUrl;

const discussionReportsApiUrl = discussionPage.dataset.reportsApiUrl;

document.addEventListener("DOMContentLoaded", () => {
    loadDiscussion();
    bindMovieReportButton();
});

async function loadDiscussion() {
    if (!discussionCanComment) {
        renderGuestDiscussionPanel();
        clearCommentsArea();
        return;
    }

    renderCommentForm();

    try {
        const comments = await fetchMovieComments();

        updateDiscussionCounts(comments.length, countReplies(comments));
        renderComments(comments);
    } catch (error) {
        console.error(error);

        updateDiscussionCounts(0, 0);

        commentsList.innerHTML = `
            <p class="discussion-empty-message">
                Could not load comments.
            </p>
        `;
    }
}

async function fetchMovieComments() {
    const url = new URL(discussionCommentsApiUrl, window.location.origin);

    url.searchParams.set("movie_id", discussionMovieId);
    url.searchParams.set("root_only", "true");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch comments.");
    }

    const data = await response.json();

    return data.comments || [];
}

function renderGuestDiscussionPanel() {
    discussionAuthPanel.innerHTML = `
        <div class="discussion-login-card">
            <p class="discussion-login-title">Join the discussion</p>
            <p class="discussion-login-text">
                Log in or create an account to share your thoughts about this movie.
            </p>

            <div class="discussion-login-actions">
                <a href="${discussionLoginUrl}" class="discussion-login-button secondary">
                    Log In
                </a>

                <a href="${discussionRegisterUrl}" class="discussion-login-button primary">
                    Create Account
                </a>
            </div>
        </div>
    `;
}

function renderCommentForm() {
    discussionAuthPanel.innerHTML = `
        <form class="discussion-comment-form" id="discussion-comment-form">
            <label for="discussion-comment-input">
                Share your thoughts
            </label>

            <textarea
                id="discussion-comment-input"
                rows="4"
                placeholder="Write your comment..."
            ></textarea>

            <div class="discussion-form-footer">
                <p class="discussion-form-message" id="discussion-form-message"></p>

                <button type="submit" id="discussion-submit-button">
                    Post Comment
                </button>
            </div>
        </form>
    `;

    const form = document.getElementById("discussion-comment-form");

    form.addEventListener("submit", event => {
        event.preventDefault();
        submitMainComment();
    });
}

function renderComments(comments) {
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <p class="discussion-empty-message">
                No comments yet. Be the first to share your thoughts!
            </p>
        `;
        return;
    }

    commentsList.innerHTML = comments
        .map(comment => createCommentHtml(comment, false))
        .join("");

    bindReplyButtons();
    bindEditButtons();
    bindDeleteButtons();
    bindReportButtons();
}

function createCommentHtml(comment, isReply) {
    const replies = comment.replies || [];

    return `
        <article class="${isReply ? "movie-comment reply" : "movie-comment"}" data-comment-id="${comment.id}">
            <div class="movie-comment-avatar">
                ${getInitial(comment.user)}
            </div>

            <div class="movie-comment-body">
                <div class="movie-comment-header">
                    <div>
                        <strong>${escapeHtml(comment.user || "Unknown user")}</strong>
                        <span>${escapeHtml(comment.created_at || "")}</span>
                    </div>

                    ${comment.can_report ? `
                        <button
                            type="button"
                            class="movie-comment-icon-button report-comment-button"
                            title="Report comment"
                            data-comment-id="${comment.id}"
                        >
                            ⚐
                        </button>
                    ` : ""}
                </div>

                <p class="movie-comment-content" id="comment-content-${comment.id}">
                    ${escapeHtml(comment.content)}
                </p>

                <div class="movie-comment-actions">
                    ${discussionCanComment ? `
                        <button
                            type="button"
                            class="movie-comment-action reply-comment-button"
                            data-comment-id="${comment.id}"
                        >
                            Reply
                        </button>
                    ` : ""}

                    ${comment.can_edit ? `
                        <button
                            type="button"
                            class="movie-comment-action edit-comment-button"
                            data-comment-id="${comment.id}"
                        >
                            Edit
                        </button>
                    ` : ""}

                    ${comment.can_delete ? `
                        <button
                            type="button"
                            class="movie-comment-action danger delete-comment-button"
                            data-comment-id="${comment.id}"
                        >
                            Delete
                        </button>
                    ` : ""}
                </div>

                <div
                    class="comment-reply-form-container"
                    id="comment-reply-form-container-${comment.id}"
                ></div>

                ${replies.length > 0 ? `
                    <div class="movie-comment-replies">
                        ${replies.map(reply => createCommentHtml(reply, true)).join("")}
                    </div>
                ` : ""}
            </div>
        </article>
    `;
}

function clearCommentsArea() {
    updateDiscussionCounts(0, 0);
    commentsList.innerHTML = "";
}

function updateDiscussionCounts(commentCount, replyCount) {
    discussionCommentCount.textContent = commentCount;
    discussionReplyCount.textContent = replyCount;
}

function countReplies(comments) {
    return comments.reduce((total, comment) => {
        const replies = comment.replies || [];

        return total + replies.length + countReplies(replies);
    }, 0);
}

async function submitMainComment() {
    const textarea = document.getElementById("discussion-comment-input");
    const messageElement = document.getElementById("discussion-form-message");
    const submitButton = document.getElementById("discussion-submit-button");

    const content = textarea.value.trim();

    if (!content) {
        showDiscussionMessage(messageElement, "Please write a comment first.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Posting...";

    try {
        const response = await fetch(discussionCommentsApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getDiscussionCookie("csrftoken"),
            },
            body: JSON.stringify({
                movie_id: Number(discussionMovieId),
                content: content,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showDiscussionMessage(
                messageElement,
                getDiscussionApiErrorMessage(data),
                "error"
            );

            submitButton.disabled = false;
            submitButton.textContent = "Post Comment";
            return;
        }

        textarea.value = "";
        showDiscussionMessage(messageElement, "Comment posted.", "success");

        await loadDiscussion();
    } catch (error) {
        console.error(error);

        showDiscussionMessage(
            messageElement,
            "Could not post comment.",
            "error"
        );

        submitButton.disabled = false;
        submitButton.textContent = "Post Comment";
    }
}

function showDiscussionMessage(element, message, type) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `discussion-form-message ${type}`;
}

function getDiscussionApiErrorMessage(data) {
    if (!data) {
        return "Something went wrong.";
    }

    if (data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorValue = data.errors[firstErrorKey];

        if (Array.isArray(firstErrorValue)) {
            return firstErrorValue[0];
        }

        return String(firstErrorValue);
    }

    if (data.error) {
        return data.error;
    }

    if (data.detail) {
        return data.detail;
    }

    return "Something went wrong.";
}

function getDiscussionCookie(name) {
    const cookies = document.cookie ? document.cookie.split(";") : [];

    for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();

        if (trimmedCookie.startsWith(`${name}=`)) {
            return decodeURIComponent(trimmedCookie.substring(name.length + 1));
        }
    }

    return "";
}

function bindReplyButtons() {
    document.querySelectorAll(".reply-comment-button").forEach(button => {
        button.addEventListener("click", () => {
            const commentId = button.dataset.commentId;
            renderReplyForm(commentId);
        });
    });
}

function renderReplyForm(parentCommentId) {
    const container = document.getElementById(
        `comment-reply-form-container-${parentCommentId}`
    );

    if (!container) {
        return;
    }

    document.querySelectorAll(".comment-reply-form-container").forEach(formContainer => {
        if (formContainer !== container) {
            formContainer.innerHTML = "";
        }
    });

    container.innerHTML = `
        <form class="comment-reply-form" id="comment-reply-form-${parentCommentId}">
            <textarea
                rows="3"
                placeholder="Write a reply..."
            ></textarea>

            <div class="comment-reply-form-footer">
                <p class="comment-reply-form-message"></p>

                <div class="comment-reply-form-actions">
                    <button type="button" class="comment-reply-cancel-button">
                        Cancel
                    </button>

                    <button type="submit" class="comment-reply-submit-button">
                        Reply
                    </button>
                </div>
            </div>
        </form>
    `;

    const form = document.getElementById(`comment-reply-form-${parentCommentId}`);
    const cancelButton = form.querySelector(".comment-reply-cancel-button");

    form.addEventListener("submit", event => {
        event.preventDefault();
        submitReplyComment(parentCommentId, form);
    });

    cancelButton.addEventListener("click", () => {
        container.innerHTML = "";
    });
}

async function submitReplyComment(parentCommentId, form) {
    const textarea = form.querySelector("textarea");
    const messageElement = form.querySelector(".comment-reply-form-message");
    const submitButton = form.querySelector(".comment-reply-submit-button");

    const content = textarea.value.trim();

    if (!content) {
        showReplyFormMessage(messageElement, "Please write a reply first.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Posting...";

    try {
        const response = await fetch(discussionCommentsApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getDiscussionCookie("csrftoken"),
            },
            body: JSON.stringify({
                movie_id: Number(discussionMovieId),
                parent_id: Number(parentCommentId),
                content: content,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showReplyFormMessage(
                messageElement,
                getDiscussionApiErrorMessage(data),
                "error"
            );

            submitButton.disabled = false;
            submitButton.textContent = "Reply";
            return;
        }

        await loadDiscussion();
    } catch (error) {
        console.error(error);

        showReplyFormMessage(
            messageElement,
            "Could not post reply.",
            "error"
        );

        submitButton.disabled = false;
        submitButton.textContent = "Reply";
    }
}

function showReplyFormMessage(element, message, type) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `comment-reply-form-message ${type}`;
}

function bindEditButtons() {
    document.querySelectorAll(".edit-comment-button").forEach(button => {
        button.addEventListener("click", () => {
            const commentId = button.dataset.commentId;
            renderEditCommentForm(commentId);
        });
    });
}

function renderEditCommentForm(commentId) {
    const contentElement = document.getElementById(`comment-content-${commentId}`);
    const container = document.getElementById(
        `comment-reply-form-container-${commentId}`
    );

    if (!contentElement || !container) {
        return;
    }

    document.querySelectorAll(".comment-reply-form-container").forEach(formContainer => {
        if (formContainer !== container) {
            formContainer.innerHTML = "";
        }
    });

    const currentContent = contentElement.textContent.trim();

    container.innerHTML = `
        <form class="comment-reply-form comment-edit-form" id="comment-edit-form-${commentId}">
            <textarea rows="3">${escapeHtml(currentContent)}</textarea>

            <div class="comment-reply-form-footer">
                <p class="comment-reply-form-message"></p>

                <div class="comment-reply-form-actions">
                    <button type="button" class="comment-reply-cancel-button">
                        Cancel
                    </button>

                    <button type="submit" class="comment-reply-submit-button">
                        Save
                    </button>
                </div>
            </div>
        </form>
    `;

    const form = document.getElementById(`comment-edit-form-${commentId}`);
    const cancelButton = form.querySelector(".comment-reply-cancel-button");

    form.addEventListener("submit", event => {
        event.preventDefault();
        updateComment(commentId, form);
    });

    cancelButton.addEventListener("click", () => {
        container.innerHTML = "";
    });
}

async function updateComment(commentId, form) {
    const textarea = form.querySelector("textarea");
    const messageElement = form.querySelector(".comment-reply-form-message");
    const submitButton = form.querySelector(".comment-reply-submit-button");

    const content = textarea.value.trim();

    if (!content) {
        showReplyFormMessage(messageElement, "Comment cannot be empty.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    try {
        const response = await fetch(`${discussionCommentsApiUrl}${commentId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getDiscussionCookie("csrftoken"),
            },
            body: JSON.stringify({
                content: content,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showReplyFormMessage(
                messageElement,
                getDiscussionApiErrorMessage(data),
                "error"
            );

            submitButton.disabled = false;
            submitButton.textContent = "Save";
            return;
        }

        await loadDiscussion();
    } catch (error) {
        console.error(error);

        showReplyFormMessage(
            messageElement,
            "Could not update comment.",
            "error"
        );

        submitButton.disabled = false;
        submitButton.textContent = "Save";
    }
}

function bindDeleteButtons() {
    document.querySelectorAll(".delete-comment-button").forEach(button => {
        button.addEventListener("click", () => {
            const commentId = button.dataset.commentId;
            deleteComment(commentId);
        });
    });
}

async function deleteComment(commentId) {
    const confirmed = window.confirm(
        "Delete this comment? If it has replies, they will be deleted too."
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${discussionCommentsApiUrl}${commentId}/`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": getDiscussionCookie("csrftoken"),
            },
        });

        if (!response.ok) {
            const data = await response.json();

            alert(getDiscussionApiErrorMessage(data));
            return;
        }

        await loadDiscussion();
    } catch (error) {
        console.error(error);
        alert("Could not delete comment.");
    }
}

function bindReportButtons() {
    document.querySelectorAll(".report-comment-button").forEach(button => {
        button.addEventListener("click", () => {
            const commentId = button.dataset.commentId;
            openCommentReportModal(commentId);
        });
    });
}

function openReportModal(config) {
    closeReportModal();

    const modal = document.createElement("div");
    modal.className = "comment-report-modal-backdrop";
    modal.id = "comment-report-modal-backdrop";

    modal.innerHTML = `
        <div class="comment-report-modal">
            <div class="comment-report-modal-header">
                <h3>${escapeHtml(config.title)}</h3>

                <button
                    type="button"
                    class="comment-report-modal-close"
                    id="comment-report-modal-close"
                    aria-label="Close report modal"
                >
                    ×
                </button>
            </div>

            <form id="comment-report-form" class="comment-report-form">
                <label for="comment-report-reason">
                    ${escapeHtml(config.label)}
                </label>

                <textarea
                    id="comment-report-reason"
                    rows="5"
                    placeholder="${escapeHtml(config.placeholder)}"
                ></textarea>

                <p class="comment-report-message" id="comment-report-message"></p>

                <div class="comment-report-actions">
                    <button
                        type="button"
                        class="comment-report-cancel-button"
                        id="comment-report-cancel-button"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="comment-report-submit-button"
                        id="comment-report-submit-button"
                    >
                        Submit Report
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("comment-report-modal-close").addEventListener("click", closeReportModal);
    document.getElementById("comment-report-cancel-button").addEventListener("click", closeReportModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeReportModal();
        }
    });

    document.getElementById("comment-report-form").addEventListener("submit", event => {
        event.preventDefault();
        submitReport(config.payload);
    });

    document.getElementById("comment-report-reason").focus();
}

function openCommentReportModal(commentId) {
    openReportModal({
        title: "Report comment",
        label: "Why should this comment be reviewed?",
        placeholder: "Explain why this comment is inappropriate or should be reviewed...",
        payload: {
            comment_id: Number(commentId),
        },
    });
}

function closeReportModal() {
    const existingModal = document.getElementById("comment-report-modal-backdrop");

    if (existingModal) {
        existingModal.remove();
    }
}

async function submitReport(payload) {
    const reasonInput = document.getElementById("comment-report-reason");
    const submitButton = document.getElementById("comment-report-submit-button");

    const reason = reasonInput.value.trim();

    if (!reason) {
        showReportMessage("Please write a reason for the report.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
        const response = await fetch(discussionReportsApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getDiscussionCookie("csrftoken"),
            },
            body: JSON.stringify({
                ...payload,
                reason: reason,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showReportMessage(
                getDiscussionApiErrorMessage(data),
                "error"
            );

            submitButton.disabled = false;
            submitButton.textContent = "Submit Report";
            return;
        }

        showReportMessage("Report submitted. Thank you.", "success");

        setTimeout(() => {
            closeReportModal();
        }, 800);
    } catch (error) {
        console.error(error);

        showReportMessage("Could not submit report.", "error");

        submitButton.disabled = false;
        submitButton.textContent = "Submit Report";
    }
}

function showReportMessage(message, type) {
    const messageElement = document.getElementById("comment-report-message");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.className = `comment-report-message ${type}`;
}

function showCommentReportMessage(message, type) {
    const messageElement = document.getElementById("comment-report-message");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.className = `comment-report-message ${type}`;
}

function bindMovieReportButton() {
    const reportButton = document.getElementById("movie-report-button");

    if (!reportButton) {
        return;
    }

    reportButton.addEventListener("click", () => {
        openMovieReportModal();
    });
}

function openMovieReportModal() {
    openReportModal({
        title: "Report movie information",
        label: "What is wrong with this movie information?",
        placeholder: "Example: wrong release year, typo in description, incorrect author...",
        payload: {
            movie_id: Number(discussionMovieId),
        },
    });
}

function getInitial(username) {
    if (!username) {
        return "?";
    }

    return username.trim()[0].toUpperCase();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}