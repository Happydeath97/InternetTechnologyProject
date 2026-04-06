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
    http_method_names = ["get", "post"]
    permission_required = ["movies.add_movie"]

    def get(self, request, *args, **kwargs):
        form = MovieForm()
        return render(request, "movies/movie/movie_create.html", {"form": form})

    def post(self, request, *args, **kwargs):
        form = MovieForm(request.POST)
        if form.is_valid():
            movie = form.save(commit=False)
            movie.created_by = request.user
            movie.save()
            return redirect("movie_detail", pk=movie.pk)  # change if needed
        return render(request, "movies/movie/movie_create.html", {"form": form})


class MovieListView(View):
    # TODO: Add filter and pagination
    http_method_names = ["get"]
    model = Movie
    template_name = "movies/movie/movie_list.html"
    context_object_name = "movies"

    def get(self, request, *args, **kwargs):
        movies = Movie.objects.annotate(avg_rating=Avg("ratings__score"))
        return render(request, "movies/movie/movie_list.html", {"movies": movies})


class MovieDetailView(View):
    #TODO: implement giving a score tot he movie maybe post to another view? or here?
    http_method_names = ["get"]

    def get(self, request, pk, *args, **kwargs):
        movie = get_object_or_404(Movie, pk=pk)
        avg_rating = Rating.objects.filter(movie=movie).aggregate(avg=Avg("score"))["avg"]
        root_comments = movie.comments.filter(parent__isnull=True)

        context = {
            "movie": movie,
            "avg_rating": avg_rating,
            "root_comments": root_comments
        }
        return render(request, "movies/movie/movie_detail.html", context=context)


class MovieUpdateView(LoginRequiredMixin, PermissionRequiredMixin, UpdateView):
    model = Movie
    form_class = MovieForm
    template_name = "movies/movie/movie_update.html"
    permission_required = "movies.change_movie"
    raise_exception = True

    def get_success_url(self):
        return reverse_lazy("movie_detail", kwargs={"pk": self.object.pk})


class MovieDeletedView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.delete_movie"
    raise_exception = True

    def post(self, request, pk, *args, **kwargs):
        movie = get_object_or_404(Movie, pk=pk)
        movie.delete()
        return redirect("movie_list")
