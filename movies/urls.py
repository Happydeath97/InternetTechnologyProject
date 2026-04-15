from django.urls import path
from movies import views as movies_v
from movies import api_views as movies_api_v

urlpatterns = [
    # =========================================================
    # NON-API PAGES
    # =========================================================

    # Home
    path("", movies_v.IndexView.as_view(), name="index"),

    # -------------------------
    # Movies
    # -------------------------
    path("movies/", movies_v.MovieListView.as_view(), name="movie_list"),
    path("movies/create/", movies_v.MovieCreateView.as_view(), name="movie_create"),
    path("movies/<int:pk>/", movies_v.MovieDetailPageView.as_view(), name="movie_detail"),
    path("movies/<int:pk>/edit/", movies_v.MovieUpdateView.as_view(), name="movie_update"),

    # -------------------------
    # Genres
    # -------------------------
    path("genres/", movies_v.GenreListView.as_view(), name="genre_list"),
    path("genres/create/", movies_v.GenreCreateView.as_view(), name="genre_create"),
    path("genres/<int:pk>/edit/", movies_v.GenreUpdateView.as_view(), name="genre_update"),
    path("genres/<int:pk>/delete/", movies_v.GenreDeleteView.as_view(), name="genre_delete"),

    # -------------------------
    # Authors
    # -------------------------
    path("authors/", movies_v.AuthorListPageView.as_view(), name="author_list"),
    path("authors/create/", movies_v.AuthorCreatePageView.as_view(), name="author_create"),
    path("authors/<int:pk>/edit/", movies_v.AuthorUpdatePageView.as_view(), name="author_update"),


    # =========================================================
    # API ENDPOINTS
    # =========================================================

    # -------------------------
    # Authors API
    # -------------------------
    path("api/authors/", movies_api_v.AuthorListApiView.as_view(), name="author_list_api"),
    path("api/authors/create/", movies_api_v.AuthorCreateApiView.as_view(), name="author_create_api"),
    path("api/authors/<int:pk>/", movies_api_v.AuthorDetailApiView.as_view(), name="author_detail_api"),
    path("api/authors/<int:pk>/edit/", movies_api_v.AuthorUpdateApiView.as_view(), name="author_update_api"),
    path("api/authors/<int:pk>/delete/", movies_api_v.AuthorDeleteApiView.as_view(), name="author_delete_api"),

    # -------------------------
    # Genres API
    # -------------------------
    path("api/genres/", movies_api_v.GenreListApiView.as_view(), name="genre_list_api"),
    path("api/genres/create/", movies_api_v.GenreCreateApiView.as_view(), name="genre_create_api"),
    path("api/genres/<int:pk>/", movies_api_v.GenreDetailApiView.as_view(), name="genre_detail_api"),
    path("api/genres/<int:pk>/edit/", movies_api_v.GenreUpdateApiView.as_view(), name="genre_update_api"),
    path("api/genres/<int:pk>/delete/", movies_api_v.GenreDeleteApiView.as_view(), name="genre_delete_api"),

    # -------------------------
    # Movies API
    # -------------------------
    path("api/movies/", movies_api_v.MovieListApiView.as_view(), name="movie_list_api"),
    path("api/movies/create/", movies_api_v.MovieCreateApiView.as_view(), name="movie_create_api"),
    path("api/movies/<int:pk>/", movies_api_v.MovieDetailApiView.as_view(), name="movie_detail_api"),
    path("api/movies/<int:pk>/edit/", movies_api_v.MovieUpdateApiView.as_view(), name="movie_update_api"),
    path("api/movies/<int:pk>/delete/", movies_api_v.MovieDeleteApiView.as_view(), name="movie_delete_api"),

    # -------------------------
    # Ratings API
    # -------------------------
    path("api/ratings/", movies_api_v.RatingListApiView.as_view(), name="rating_list_api"),
    path("api/ratings/create/", movies_api_v.RatingCreateApiView.as_view(), name="rating_create_api"),
    path("api/ratings/<int:pk>/", movies_api_v.RatingDetailApiView.as_view(), name="rating_detail_api"),
    path("api/ratings/<int:pk>/edit/", movies_api_v.RatingUpdateApiView.as_view(), name="rating_update_api"),
    path("api/ratings/<int:pk>/delete/", movies_api_v.RatingDeleteApiView.as_view(), name="rating_delete_api"),

    # Movie-specific rating helpers
    path("api/rating/<int:pk>/", movies_api_v.RatingMovieApiView.as_view(), name="avg_rating_api"),
    path("api/rating/<int:pk>/vote/", movies_api_v.RatingVoteApiView.as_view(), name="rating_vote_api"),

    # -------------------------
    # Comments API
    # -------------------------
    path("api/comments/", movies_api_v.CommentListApiView.as_view(), name="comment_list_api"),
    path("api/comments/create/", movies_api_v.CommentCreateApiView.as_view(), name="comment_create_api"),
    path("api/comments/<int:pk>/", movies_api_v.CommentDetailApiView.as_view(), name="comment_detail_api"),
    path("api/comments/<int:pk>/edit/", movies_api_v.CommentUpdateApiView.as_view(), name="comment_update_api"),
    path("api/comments/<int:pk>/delete/", movies_api_v.CommentDeleteApiView.as_view(), name="comment_delete_api"),

    # Movie-specific comments helper
    path("api/comments/movie/<int:pk>/", movies_api_v.CommentsApiView.as_view(), name="movie_comments_api"),

    # -------------------------
    # Reports API
    # -------------------------
    path("api/reports/", movies_api_v.ReportListApiView.as_view(), name="report_list_api"),
    path("api/reports/create/", movies_api_v.ReportCreateApiView.as_view(), name="report_create_api"),
    path("api/reports/<int:pk>/", movies_api_v.ReportDetailApiView.as_view(), name="report_detail_api"),
    path("api/reports/<int:pk>/edit/", movies_api_v.ReportUpdateApiView.as_view(), name="report_update_api"),
    path("api/reports/<int:pk>/delete/", movies_api_v.ReportDeleteApiView.as_view(), name="report_delete_api"),
    path("api/reports/<int:pk>/review/", movies_api_v.ReportReviewApiView.as_view(), name="report_review_api"),
]
