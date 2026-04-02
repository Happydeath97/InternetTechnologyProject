from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin,  PermissionRequiredMixin
from django.shortcuts import get_object_or_404, redirect, render

from .forms import AuthorForm, GenreForm, MovieForm
from .models import Movie, Genre, Author


class IndexView(View):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        return render(request, "movies/index.html")


class AuthorCreateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get", "post"]
    permission_required = ["movies.add_author"]

    def get(self, request, *args, **kwargs):
        form = AuthorForm()
        return render(request, "movies/author_create.html", {"form": form})

    def post(self, request, *args, **kwargs):
        form = AuthorForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("movie_create")  # change to your url name
        return render(request, "movies/author_create.html", {"form": form})


class AuthorListView(View):
    http_method_names = ["get"]
    permission_required = "movies.view_author"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        authors = Author.objects.all()
        return render(request, "movies/author_list.html", {"authors": authors})


class AuthorUpdateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get", "post"]
    permission_required = "movies.change_author"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)
        form = AuthorForm(instance=author)
        return render(request, "movies/author_update.html", {"form": form, "author": author})

    def post(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)
        form = AuthorForm(request.POST, instance=author)
        if form.is_valid():
            form.save()
            return redirect("author_list")
        return render(request, "movies/author_update.html", {"form": form, "author": author})


class AuthorDeleteView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.delete_author"
    raise_exception = True

    def post(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)
        author.delete()
        return redirect("author_list")


class GenreCreateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get", "post"]
    permission_required = ["movies.add_genre"]

    def get(self, request, *args, **kwargs):
        form = GenreForm()
        return render(request, "movies/genre_create.html", {"form": form})

    def post(self, request, *args, **kwargs):
        form = GenreForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("movie_create")  # change to your url name
        return render(request, "movies/genre_create.html", {"form": form})


class GenreListView(View):
    http_method_names = ["get"]
    permission_required = "movies.view_genre"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        genres = Genre.objects.all()
        return render(request, "movies/genre_list.html", {"genres": genres})


class GenreUpdateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get", "post"]
    permission_required = "movies.change_genre"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        genre = get_object_or_404(Genre, pk=pk)
        form = GenreForm(instance=genre)
        return render(request, "movies/genre_update.html", {"form": form, "genre": genre})

    def post(self, request, pk, *args, **kwargs):
        genre = get_object_or_404(Genre, pk=pk)
        form = GenreForm(request.POST, instance=genre)
        if form.is_valid():
            form.save()
            return redirect("genre_list")
        return render(request, "movies/genre_update.html", {"form": form, "genre": genre})


class GenreDeleteView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.delete_genre"
    raise_exception = True

    def post(self, request, pk, *args, **kwargs):
        genre = get_object_or_404(Genre, pk=pk)
        genre.delete()
        return redirect("genre_list")


class MovieCreateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get", "post"]
    permission_required = ["movies.add_movie"]

    def get(self, request, *args, **kwargs):
        form = MovieForm()
        return render(request, "movies/movie_create.html", {"form": form})

    def post(self, request, *args, **kwargs):
        form = MovieForm(request.POST)
        if form.is_valid():
            movie = form.save(commit=False)
            movie.created_by = request.user
            movie.save()
            return redirect("movie_detail", pk=movie.pk)  # change if needed
        return render(request, "movies/movie_create.html", {"form": form})


class MovieListView(View):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        movies = Movie.objects.all()
        return render(request, "movies/movie_list.html", {"movies": movies})


class MovieDetailView(View):
    http_method_names = ["get"]

    def get(self, request, pk, *args, **kwargs):
        movie = get_object_or_404(Movie, pk=pk)
        return render(request, "movies/movie_detail.html", {"movie": movie})
