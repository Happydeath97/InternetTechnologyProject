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
    path("api/authors/", movies_api_v.AuthorListApiView.as_view(), name="author_api"),
    path("api/authors/<int:pk>/", movies_api_v.AuthorDetailApiView.as_view(), name="author_detail_api"),

    # -------------------------
    # Genres API
    # -------------------------
    path("api/genres/", movies_api_v.GenreListApiView.as_view(), name="genre_api"),
    path("api/genres/<int:pk>/", movies_api_v.GenreDetailApiView.as_view(), name="genre_detail_api"),

    # -------------------------
    # Movies API
    # -------------------------
    path("api/movies/", movies_api_v.MovieListApiView.as_view(), name="movie_api"),
    path("api/movies/<int:pk>/", movies_api_v.MovieDetailApiView.as_view(), name="movie_detail_api"),

    # -------------------------
    # Ratings API
    # -------------------------
    path("api/ratings/", movies_api_v.RatingListApiView.as_view(), name="rating_api"),
    path("api/ratings/<int:pk>/", movies_api_v.RatingDetailApiView.as_view(), name="rating_detail_api"),

    # -------------------------
    # Comments API
    # -------------------------
    path("api/comments/", movies_api_v.CommentListApiView.as_view(), name="comment_api"),
    path("api/comments/<int:pk>/", movies_api_v.CommentDetailApiView.as_view(), name="comment_detail_api"),

    # -------------------------
    # Reports API
    # -------------------------
    path("api/reports/", movies_api_v.ReportListApiView.as_view(), name="report_api"),
    path("api/reports/<int:pk>/", movies_api_v.ReportDetailApiView.as_view(), name="report_detail_api"),
]
