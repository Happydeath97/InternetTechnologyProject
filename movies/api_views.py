from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.shortcuts import get_object_or_404
from django.db.models import Avg
from django.http import JsonResponse
from django.urls import reverse

from .forms import AuthorForm, GenreForm, MovieForm
from .models import Movie, Genre, Author, Rating, Comment
from .serializers import (
    AuthorSerializer,
    MovieDetailSerializer,
    RatingSerializer,
    RatingVoteSerializer,
    CommentSerializer, MovieSerializer,
    # TODO: add/import these when you implement them
    # GenreSerializer,
    # MovieSerializer,
)

import json


# TODO create serializers for the data instead of doing it in the views


# =========================
# AUTHOR
# =========================

class AuthorListApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    # TODO: add filter and pagination
    http_method_names = ["get"]
    permission_required = "movies.view_author"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        authors = Author.objects.all()
        serializer = AuthorSerializer(authors, many=True)

        data = {
            "authors": serializer.data
        }

        return JsonResponse(data, status=200)


class AuthorCreateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = ["movies.add_author"]

    def post(self, request, *args, **kwargs):
        form = AuthorForm(request.POST)

        if form.is_valid():
            author = form.save()
            return JsonResponse(
                {
                    "message": "Author created successfully.",
                    "author": {
                        "id": author.id,
                        "full_name": author.full_name,
                    }
                },
                status=201
            )

        return JsonResponse(
            {
                "errors": form.errors,
            },
            status=400
        )


class AuthorDetailApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_author"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)
        serializer = AuthorSerializer(author)
        data = {"author": serializer.data}

        return JsonResponse(data=data, status=200)


class AuthorUpdateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.change_author"
    raise_exception = True

    def post(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)
        form = AuthorForm(request.POST, instance=author)

        if form.is_valid():
            updated_author = form.save()
            return JsonResponse(
                {
                    "message": "Author updated successfully.",
                    "author": {
                        "id": updated_author.id,
                        "full_name": updated_author.full_name,
                        "date_of_birth": updated_author.date_of_birth,
                    }
                },
                status=200
            )

        return JsonResponse(
            {
                "errors": form.errors,
            },
            status=400
        )


class AuthorDeleteApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["delete"]
    permission_required = "movies.delete_author"
    raise_exception = True

    def delete(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)
        author.delete()

        return JsonResponse(
            data={"message": "Author deleted successfully."},
            status=200
        )


# =========================
# GENRE
# =========================

class GenreListApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_genre"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        genres = Genre.objects.all()

        data = {
            "genres": [
                {
                    "id": genre.id,
                    "name": genre.name,
                }
                for genre in genres
            ]
        }

        return JsonResponse(data, status=200)

class GenreCreateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.add_genre"
    raise_exception = True

    def post(self, request, *args, **kwargs):
        """
        POST /api/genres/
        Create a new genre.
        """
        pass


class GenreDetailApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_genre"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        """
        GET /api/genres/<int:pk>/
        Read one specific genre.
        """
        pass


class GenreUpdateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["patch"]
    permission_required = "movies.change_genre"
    raise_exception = True

    def patch(self, request, pk, *args, **kwargs):
        """
        PATCH /api/genres/<int:pk>/
        Update one specific genre.
        """
        pass


class GenreDeleteApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["delete"]
    permission_required = "movies.delete_genre"
    raise_exception = True

    def delete(self, request, pk, *args, **kwargs):
        """
        DELETE /api/genres/<int:pk>/
        Delete one specific genre.
        """
        pass


# =========================
# MOVIE
# =========================

class MovieListApiView(LoginRequiredMixin, View):
    # TODO: add filter and pagination
    http_method_names = ["get"]
    raise_exception = True

    def get(self, request, *args, **kwargs):
        movies = (
            Movie.objects
            .prefetch_related("author", "genre")
            .select_related("created_by")
            .annotate(avg_rating=Avg("ratings__score"))
        )

        serializer = MovieSerializer(movies, many=True)

        data = {
            "movies": serializer.data
        }

        return JsonResponse(data, status=200)

class MovieCreateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.add_movie"
    raise_exception = True

    def post(self, request, *args, **kwargs):
        form = MovieForm(request.POST)

        if form.is_valid():
            movie = form.save(commit=False)
            movie.created_by = request.user
            movie.save()
            form.save_m2m()

            return JsonResponse(
                data={
                    "message": "Movie created successfully.",
                    "movie": {
                        "id": movie.id,
                        "title": movie.title,
                        "release_year": movie.release_year,
                    },
                    "redirect_url": f"/movies/{movie.pk}/",
                },
                status=201
            )

        return JsonResponse(data={"errors": form.errors}, status=400)


class MovieDetailApiView(View):
    # TODO: implement giving a score to the movie maybe post to another view? or here?
    http_method_names = ["get"]

    def get(self, request, pk, *args, **kwargs):
        movie = get_object_or_404(
            Movie.objects.prefetch_related("author", "genre"),
            pk=pk
        )

        serializer = MovieDetailSerializer(movie)

        return JsonResponse(
            {
                "movie": serializer.data,
                "permissions": {
                    "can_edit_movie": request.user.has_perm("movies.change_movie"),
                    "can_delete_movie": request.user.has_perm("movies.delete_movie"),
                },
            },
            status=200,
        )


class MovieUpdateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.change_movie"
    raise_exception = True

    def post(self, request, pk, *args, **kwargs):
        movie = get_object_or_404(Movie, pk=pk)
        form = MovieForm(request.POST, instance=movie)

        if form.is_valid():
            updated_movie = form.save()

            return JsonResponse(
                {
                    "message": "Movie updated successfully.",
                    "movie": {
                        "id": updated_movie.id,
                        "title": updated_movie.title,
                        "release_year": updated_movie.release_year,
                    },
                    "redirect_url": f"/movies/{updated_movie.pk}/",
                },
                status=200
            )

        return JsonResponse(
            {
                "errors": form.errors,
            },
            status=400
        )


class MovieDeleteApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["delete"]
    permission_required = "movies.delete_movie"
    raise_exception = True

    def delete(self, request, pk, *args, **kwargs):
        movie = get_object_or_404(Movie, pk=pk)
        movie.delete()

        return JsonResponse(
            {
                "message": "Movie deleted successfully.",
                "redirect_url": reverse("movie_list"),
            },
            status=200
        )

# =========================
# RATING
# =========================

class RatingListApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_rating"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        """
        GET /api/ratings/?movie=&user=&score=&page=&page_size=&ordering=
        List all ratings with filtering and pagination.
        """
        pass


class RatingCreateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.add_rating"
    raise_exception = True

    def post(self, request, *args, **kwargs):
        """
        POST /api/ratings/
        Create a new rating.
        """
        pass


class RatingDetailApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_rating"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        """
        GET /api/ratings/<int:pk>/
        Read one specific rating.
        """
        pass


class RatingUpdateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["patch"]
    permission_required = "movies.change_rating"
    raise_exception = True

    def patch(self, request, pk, *args, **kwargs):
        """
        PATCH /api/ratings/<int:pk>/
        Update one specific rating.
        """
        pass


class RatingDeleteApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["delete"]
    permission_required = "movies.delete_rating"
    raise_exception = True

    def delete(self, request, pk, *args, **kwargs):
        """
        DELETE /api/ratings/<int:pk>/
        Delete one specific rating.
        """
        pass


class RatingMovieApiView(View):
    http_method_names = ["get"]

    def get(self, request, pk, *args, **kwargs):
        avg_score = Rating.objects.filter(movie_id=pk).aggregate(avg=Avg("score"))

        return JsonResponse(
            data={
                "average_score": avg_score["avg"],
                "can_vote": request.user.has_perm("movies.add_rating"),
            },
            status=200
        )


class RatingVoteApiView(View):
    http_method_names = ["post"]

    def post(self, request, pk, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        if not request.user.has_perm("movies.add_rating"):
            return JsonResponse({"error": "You cannot vote."}, status=403)

        if Rating.objects.filter(movie_id=pk, user=request.user).exists():
            return JsonResponse({"error": "You already rated this movie."}, status=400)

        movie = Movie.objects.filter(pk=pk).first()
        if not movie:
            return JsonResponse({"error": "Movie not found."}, status=404)

        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON."}, status=400)

        serializer = RatingVoteSerializer(data=body)

        if not serializer.is_valid():
            return JsonResponse({"errors": serializer.errors}, status=400)

        rating = Rating.objects.create(
            movie=movie,
            user=request.user,
            score=serializer.validated_data["score"],
        )

        return JsonResponse(
            {
                "message": "Rating saved successfully.",
                "rating": RatingSerializer(rating).data,
            },
            status=201,
        )


# =========================
# COMMENT
# =========================

class CommentListApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_comment"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        """
        GET /api/comments/?movie=&user=&parent=&page=&page_size=&ordering=
        List all comments with filtering and pagination.
        """
        pass


class CommentCreateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.add_comment"
    raise_exception = True

    def post(self, request, *args, **kwargs):
        """
        POST /api/comments/
        Create a new comment.
        Can create root comment or reply if parent is provided.
        """
        pass


class CommentDetailApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_comment"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        """
        GET /api/comments/<int:pk>/
        Read one specific comment.
        """
        pass


class CommentUpdateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["patch"]
    permission_required = "movies.change_comment"
    raise_exception = True

    def patch(self, request, pk, *args, **kwargs):
        """
        PATCH /api/comments/<int:pk>/
        Update one specific comment.
        """
        pass


class CommentDeleteApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["delete"]
    permission_required = "movies.delete_comment"
    raise_exception = True

    def delete(self, request, pk, *args, **kwargs):
        """
        DELETE /api/comments/<int:pk>/
        Delete one specific comment.
        """
        pass


class CommentsApiView(View):
    http_method_names = ["get"]

    def get(self, request, pk, *args, **kwargs):
        root_comments = (
            Comment.objects
            .filter(movie_id=pk, parent__isnull=True)
            .select_related("user")
            .prefetch_related("replies__user", "replies__replies")
            .order_by("-created_at")
        )

        serializer = CommentSerializer(root_comments, many=True)

        return JsonResponse(
            {
                "comments": serializer.data,
                "can_comment": request.user.has_perm("movies.add_comment"),
            },
            status=200
        )


# =========================
# REPORT
# =========================

class ReportListApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_report"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        """
        GET /api/reports/?status=&movie=&comment=&user=&reviewed_by=&page=&page_size=&ordering=
        List all reports with filtering and pagination.
        """
        # Get the reports put them in data

        data = {
            "reports": None
        }

        return JsonResponse(data=data, status=200)


class ReportCreateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.add_report"
    raise_exception = True

    def post(self, request, *args, **kwargs):
        """
        POST /api/reports/create
        Create a new report for a movie or a comment.
        """
        pass


class ReportDetailApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_report"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        """
        GET /api/reports/<int:pk>/
        Read one specific report.
        """
        pass


class ReportUpdateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["patch"]
    permission_required = "movies.change_report"
    raise_exception = True

    def patch(self, request, pk, *args, **kwargs):
        """
        PATCH /api/reports/<int:pk>/
        Update one specific report.
        Usually for moderation fields like status or reason.
        """
        pass


class ReportDeleteApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["delete"]
    permission_required = "movies.delete_report"
    raise_exception = True

    def delete(self, request, pk, *args, **kwargs):
        """
        DELETE /api/reports/<int:pk>/
        Delete one specific report.
        """
        pass


class ReportReviewApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["patch"]
    permission_required = "movies.change_report"
    raise_exception = True

    def patch(self, request, pk, *args, **kwargs):
        """
        PATCH /api/reports/<int:pk>/review/
        Review a report by setting status, reviewed_by, and reviewed_at.
        """
        pass


# how to redo the views
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticatedOrReadOnly
# from django.shortcuts import get_object_or_404
#
# from .models import Movie
# from .serializers import MovieSerializer


# class MovieApiView(APIView):
#     permission_classes = [IsAuthenticatedOrReadOnly]
#
#     def get(self, request, pk=None):
#         # GET /api/movies/        -> list
#         # GET /api/movies/1/      -> detail
#         if pk is None:
#             movies = Movie.objects.all()
#             serializer = MovieSerializer(movies, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#
#         movie = get_object_or_404(Movie, pk=pk)
#         serializer = MovieSerializer(movie)
#         return Response(serializer.data, status=status.HTTP_200_OK)
#
#     def post(self, request):
#         # POST /api/movies/
#         serializer = MovieSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(created_by=request.user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#     def put(self, request, pk):
#         # PUT /api/movies/1/
#         movie = get_object_or_404(Movie, pk=pk)
#         serializer = MovieSerializer(movie, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#     def patch(self, request, pk):
#         # PATCH /api/movies/1/
#         movie = get_object_or_404(Movie, pk=pk)
#         serializer = MovieSerializer(movie, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#     def delete(self, request, pk):
#         # DELETE /api/movies/1/
#         movie = get_object_or_404(Movie, pk=pk)
#         movie.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


