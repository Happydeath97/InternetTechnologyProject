from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin,  PermissionRequiredMixin
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth.models import User
from django.db.models import Avg, Count

from movies.models import Movie, Genre, Rating, Comment, Author

import random
from datetime import date


class IndexView(View):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        movie_count = Movie.objects.count()
        review_count = Rating.objects.count()
        member_count = User.objects.count()
        genre_count = Genre.objects.count()

        movie_queryset = (
            Movie.objects
            .annotate(avg_rating=Avg("ratings__score"), rating_count=Count("ratings"))
        )

        featured_movies = list(movie_queryset)

        daily_seed = int(date.today().strftime("%Y%m%d"))
        random.Random(daily_seed).shuffle(featured_movies)

        featured_movies = featured_movies[:5]

        top_rated_movies = (
            Movie.objects
            .annotate(avg_rating=Avg("ratings__score"), rating_count=Count("ratings"))
            .filter(avg_rating__isnull=False)
            .order_by("-avg_rating")[:3]
        )

        genres = (
            Genre.objects
            .annotate(movie_count=Count("movies"))
            .order_by("name")[:5]
        )

        context = {
            "movie_count": movie_count,
            "review_count": review_count,
            "member_count": member_count,
            "genre_count": genre_count,
            "featured_movies": featured_movies,
            "top_rated_movies": top_rated_movies,
            "genres": genres,
        }

        return render(request, "movies/index.html", context=context)


class ReportListPageView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = ["movies.view_report"]
    raise_exception = True

    def get(self, request, *args, **kwargs):
        return render(request, "movies/report/report_list.html")


class AuthorCreatePageView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = ["movies.add_author"]

    def get(self, request, *args, **kwargs):
        return render(request, "movies/author/author_create.html")


class AuthorListPageView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.change_author"
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
    http_method_names = ["get"]
    permission_required = "movies.add_genre"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        return render(request, "movies/genre/genre_create.html")


class GenreListView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.change_genre"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        return render(request, "movies/genre/genre_list.html")


class GenreUpdateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.change_genre"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        return render(
            request,
            "movies/genre/genre_update.html",
            {"genre_id": pk}
        )


class MovieCreateView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = ["movies.add_movie"]
    raise_exception = True
    template_name = "movies/movie/movie_create.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


class MovieListView(View):
    http_method_names = ["get"]
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