from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin,  PermissionRequiredMixin
from django.shortcuts import get_object_or_404, redirect, render
from django.db.models import Avg
from django.urls import reverse_lazy
from django.views.generic import UpdateView

from .forms import AuthorForm, GenreForm, MovieForm
from .models import Movie, Genre, Author, Rating

#TODO: go over permissions and make sure it matches the user levels are design


class IndexView(View):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        return render(request, "movies/index.html")


class AuthorCreatePageView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = ["movies.add_author"]

    def get(self, request, *args, **kwargs):
        return render(request, "movies/author/author_create.html")


class AuthorListPageView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_author"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        return render(request, "movies/author/author_list.html")


class AuthorUpdatePageView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.change_author"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)
        return render(request, "movies/author/author_update.html", {"author": author})


class GenreCreateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get", "post"]
    permission_required = ["movies.add_genre"]

    def get(self, request, *args, **kwargs):
        form = GenreForm()
        return render(request, "movies/genre/genre_create.html", {"form": form})

    def post(self, request, *args, **kwargs):
        form = GenreForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("genre_list")
        return render(request, "movies/genre/genre_create.html", {"form": form})


class GenreListView(LoginRequiredMixin, PermissionRequiredMixin, View):
    #TODO: Filter & pagination
    http_method_names = ["get"]
    permission_required = "movies.view_genre"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        genres = Genre.objects.all()
        return render(request, "movies/genre/genre_list.html", {"genres": genres})


class GenreUpdateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get", "post"]
    permission_required = "movies.change_genre"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        genre = get_object_or_404(Genre, pk=pk)
        form = GenreForm(instance=genre)
        return render(request, "movies/genre/genre_update.html", {"form": form, "genre": genre})

    def post(self, request, pk, *args, **kwargs):
        genre = get_object_or_404(Genre, pk=pk)
        form = GenreForm(request.POST, instance=genre)
        if form.is_valid():
            form.save()
            return redirect("genre_list")
        return render(request, "movies/genre/genre_update.html", {"form": form, "genre": genre})


class GenreDeleteView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.delete_genre"
    raise_exception = True

    def post(self, request, pk, *args, **kwargs):
        genre = get_object_or_404(Genre, pk=pk)
        genre.delete()
        return redirect("genre_list")


class MovieCreateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = ["movies.add_movie"]
    raise_exception = True
    template_name = "movies/movie/movie_create.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


class MovieListView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_movie"
    raise_exception = True
    template_name = "movies/movie/movie_list.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


class MovieDetailPageView(View):
    http_method_names = ["get"]

    def get(self, request, pk, *args, **kwargs):
        return render(request, "movies/movie/movie_detail.html", {"movie_id": pk})


class MovieUpdateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.change_movie"
    raise_exception = True
    template_name = "movies/movie/movie_update.html"

    def get(self, request, pk, *args, **kwargs):
        return render(request, self.template_name, {"movie_id": pk})