document.addEventListener("DOMContentLoaded", initMovieComments);

async function initMovieComments() {
    const page = document.getElementById("movie-detail-page");
    if (!page) return;

    const movieId = page.dataset.movieId;
    if (!movieId) return;

    try {
        const response = await fetch(`/api/comments/movie/${movieId}/`);

        if (!response.ok) {
            throw new Error("Failed to fetch comments.");
        }

        const data = await response.json();
        renderComments(data.comments || []);
    } catch (error) {
        renderCommentsError(error);
    }
}

function renderComments(comments) {
    const commentsList = document.getElementById("comments-list");
    if (!commentsList) return;

    if (!comments.length) {
        commentsList.innerHTML = "<p>No comment available.</p>";
        return;
    }

    let html = "";

    for (const comment of comments) {
        html += renderCommentItem(comment, 0);
    }

    commentsList.innerHTML = html;
}

function renderCommentItem(comment, level) {
    const isUpdated = comment.updated_at !== comment.created_at;
    const label = isUpdated ? "Updated:" : "Created:";
    const timestamp = isUpdated ? comment.updated_at : comment.created_at;

    let repliesHtml = "";

    if (comment.replies && comment.replies.length > 0) {
        for (const reply of comment.replies) {
            repliesHtml += renderCommentItem(reply, level + 2);
        }
    }

    return `
        <div class="comment-card" style="margin-left: ${level}0px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>User:</strong> ${escapeHtml(comment.user)}
                </div>

                <div>
                    <strong>${label}</strong>
                    ${escapeHtml(timestamp)}
                </div>
            </div>

            <p><strong>Comment:</strong> ${escapeHtml(comment.content)}</p>

            <div class="comment-replies">
                ${repliesHtml}
            </div>
        </div>
    `;
}

function renderCommentsError(error) {
    const commentsList = document.getElementById("comments-list");
    if (commentsList) {
        commentsList.innerHTML = "<p>Failed to load comments.</p>";
    }

    console.error(error);
}

function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}