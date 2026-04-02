from django.urls import path
from movies import views as movies_v

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
    path("authors/", movies_v.AuthorListView.as_view(), name="author_list"),
    path("authors/create/", movies_v.AuthorCreateView.as_view(), name="author_create"),
    path("authors/<int:pk>/edit/", movies_v.AuthorUpdateView.as_view(), name="author_update"),
    path("authors/<int:pk>/delete/", movies_v.AuthorDeleteView.as_view(), name="author_delete"),
]