from django.urls import path
from movies import views as movies_v
from movies import api_views as movies_api_v

urlpatterns = [
    path("", movies_v.IndexView.as_view(), name="index"),
    path("movies/", movies_v.MovieListView.as_view(), name="movie_list"),
    path("movies/<int:pk>/", movies_v.MovieDetailView.as_view(), name="movie_detail"),
    path("movies/create/", movies_v.MovieCreateView.as_view(), name="movie_create"),
    path("movies/<int:pk>/edit/", movies_v.MovieUpdateView.as_view(), name="movie_update"),
    path("movies/<int:pk>/delete/", movies_v.MovieDeletedView.as_view(), name="movie_delete"),
    path("genres/", movies_v.GenreListView.as_view(), name="genre_list"),
    path("genres/create/", movies_v.GenreCreateView.as_view(), name="genre_create"),
    path("genres/<int:pk>/delete/", movies_v.GenreDeleteView.as_view(), name="genre_delete"),
    path("genres/<int:pk>/edit/", movies_v.GenreUpdateView.as_view(), name="genre_update"),
    path("authors/", movies_v.AuthorListPageView.as_view(), name="author_list"),
    path("api/authors/", movies_api_v.AuthorListApiView.as_view(), name="author_list_api"),
    path("authors/create/", movies_v.AuthorCreatePageView.as_view(), name="author_create"),
    path("api/authors/create/", movies_api_v.AuthorCreateApiView.as_view(), name="author_create_api"),
    path("authors/<int:pk>/edit/", movies_v.AuthorUpdatePageView.as_view(), name="author_update"),
    path("api/authors/<int:pk>/", movies_api_v.AuthorDetailApiView.as_view(), name="author_detail_api"),
    path("api/authors/<int:pk>/edit/", movies_api_v.AuthorUpdateApiView.as_view(), name="author_update_api"),
    path("api/authors/<int:pk>/delete/", movies_api_v.AuthorDeleteApiView.as_view(), name="author_delete_api"),
]