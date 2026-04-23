from django.shortcuts import get_object_or_404
from django.db.models import Avg
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication

from .models import Movie, Genre, Author, Rating, Comment, Report
from .permissions import (AuthorApiPermission, GenreApiPermission, MovieApiPermission,
                          RatingApiPermission, CommentApiPermission, ReportApiPermission)
from .serializers import (AuthorSerializer, GenreSerializer, RatingSerializer,
                          CommentSerializer, MovieSerializer, ReportSerializer)

# =========================
# AUTHOR
# =========================

class AuthorApiView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [AuthorApiPermission]

    def get_author(self, pk):
        return get_object_or_404(Author, pk=pk)

    def get(self, request, pk=None):
        # GET /api/authors/        -> list
        # GET /api/authors/1/      -> detail
        if pk is None:
            full_name = request.query_params.get("full_name")
            if full_name:
                authors = Author.objects.filter(full_name__icontains=full_name.strip())
            else:
                authors = Author.objects.all()

            serializer = AuthorSerializer(authors, many=True)
            return Response(
                {"authors": serializer.data},
                status=status.HTTP_200_OK
            )

        author = self.get_author(pk)
        serializer = AuthorSerializer(author)
        return Response(
            {"author": serializer.data},
            status=status.HTTP_200_OK
        )

    def post(self, request, pk=None):
        # POST /api/authors/
        if pk is not None:
            return Response(
                {"error": "POST is not allowed on a specific resource URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        serializer = AuthorSerializer(data=request.data)
        if serializer.is_valid():
            author = serializer.save()
            return Response(
                {
                    "message": "Author created successfully.",
                    "author": AuthorSerializer(author).data,
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def put(self, request, pk=None):
        # PUT /api/authors/1/
        if pk is None:
            return Response(
                {"error": "PUT requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        author = self.get_author(pk)
        serializer = AuthorSerializer(author, data=request.data)
        if serializer.is_valid():
            updated_author = serializer.save()
            return Response(
                {
                    "message": "Author updated successfully.",
                    "author": AuthorSerializer(updated_author).data,
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, pk=None):
        # PATCH /api/authors/1/
        if pk is None:
            return Response(
                {"error": "PATCH requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        author = self.get_author(pk)
        serializer = AuthorSerializer(author, data=request.data, partial=True)
        if serializer.is_valid():
            updated_author = serializer.save()
            return Response(
                {
                    "message": "Author updated successfully.",
                    "author": AuthorSerializer(updated_author).data,
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk=None):
        # DELETE /api/authors/1/
        if pk is None:
            return Response(
                {"error": "DELETE requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        author = self.get_author(pk)
        author_data = AuthorSerializer(author).data
        author.delete()
        return Response(
            {
                "message": "Author deleted successfully.",
                "author": author_data,
            },
            status=status.HTTP_200_OK
        )

# =========================
# GENRE
# =========================

class GenreApiView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [GenreApiPermission]

    def get_genre(self, pk):
        return get_object_or_404(Genre, pk=pk)

    def get(self, request, pk=None):
        # GET /api/genres/            -> list
        # GET /api/genres/?name=act   -> filtered list
        # GET /api/genres/1/          -> detail

        if pk is None:
            genres = Genre.objects.all()

            name = request.query_params.get("name")
            if name:
                genres = genres.filter(name__icontains=name.strip())

            serializer = GenreSerializer(genres, many=True)
            return Response(
                {"genres": serializer.data},
                status=status.HTTP_200_OK
            )

        genre = self.get_genre(pk)
        serializer = GenreSerializer(genre)
        return Response(
            {"genre": serializer.data},
            status=status.HTTP_200_OK
        )

    def post(self, request, pk=None):
        # POST /api/genres/
        if pk is not None:
            return Response(
                {"error": "POST is not allowed on a specific resource URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        serializer = GenreSerializer(data=request.data)
        if serializer.is_valid():
            genre = serializer.save()
            return Response(
                {
                    "message": "Genre created successfully.",
                    "genre": GenreSerializer(genre).data,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def put(self, request, pk=None):
        # PUT /api/genres/1/
        if pk is None:
            return Response(
                {"error": "PUT requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        genre = self.get_genre(pk)
        serializer = GenreSerializer(genre, data=request.data)
        if serializer.is_valid():
            updated_genre = serializer.save()
            return Response(
                {
                    "message": "Genre updated successfully.",
                    "genre": GenreSerializer(updated_genre).data,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, pk=None):
        # PATCH /api/genres/1/
        if pk is None:
            return Response(
                {"error": "PATCH requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        genre = self.get_genre(pk)
        serializer = GenreSerializer(genre, data=request.data, partial=True)
        if serializer.is_valid():
            updated_genre = serializer.save()
            return Response(
                {
                    "message": "Genre updated successfully.",
                    "genre": GenreSerializer(updated_genre).data,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk=None):
        # DELETE /api/genres/1/
        if pk is None:
            return Response(
                {"error": "DELETE requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        genre = self.get_genre(pk)
        genre_data = GenreSerializer(genre).data
        genre.delete()

        return Response(
            {
                "message": "Genre deleted successfully.",
                "genre": genre_data,
            },
            status=status.HTTP_200_OK
        )

# =========================
# MOVIE
# =========================

class MovieApiView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [MovieApiPermission]

    def get_queryset(self):
        return (
            Movie.objects
            .select_related("created_by")
            .prefetch_related("author", "genre")
            .annotate(avg_rating=Avg("ratings__score"))
        )

    def get_movie(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def require_pk(self, pk, method_name):
        if pk is None:
            return Response(
                {"error": f"{method_name} requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )
        return None

    def get(self, request, pk=None):
        # GET /api/movies/                    -> list
        # GET /api/movies/?title=dune         -> filtered list
        # GET /api/movies/?author=tolkien     -> filtered list
        # GET /api/movies/?genre=fantasy      -> filtered list
        # GET /api/movies/?release_year=2021  -> filtered list
        # GET /api/movies/1/                  -> detail

        if pk is None:
            movies = self.get_queryset()

            title = request.query_params.get("title")
            if title:
                movies = movies.filter(title__icontains=title.strip())

            author = request.query_params.get("author")
            if author:
                movies = movies.filter(author__full_name__icontains=author.strip())

            genre = request.query_params.get("genre")
            if genre:
                movies = movies.filter(genre__name__icontains=genre.strip())

            release_year = request.query_params.get("release_year")
            if release_year:
                movies = movies.filter(release_year=release_year)

            created_by = request.query_params.get("created_by")
            if created_by:
                movies = movies.filter(created_by__username__icontains=created_by.strip())

            movies = movies.distinct()

            serializer = MovieSerializer(movies, many=True, context={"request": request})
            return Response(
                {"movies": serializer.data},
                status=status.HTTP_200_OK,
            )

        movie = self.get_movie(pk)
        serializer = MovieSerializer(movie, context={"request": request})

        return Response(
            {
                "movie": serializer.data,
                "permissions": {
                    "can_edit_movie": (
                        request.user.is_authenticated
                        and request.user.has_perm("movies.change_movie")
                    ),
                    "can_delete_movie": (
                        request.user.is_authenticated
                        and request.user.has_perm("movies.delete_movie")
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, pk=None):
        # POST /api/movies/
        if pk is not None:
            return Response(
                {"error": "POST is not allowed on a specific resource URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )

        serializer = MovieSerializer(data=request.data)
        if serializer.is_valid():
            movie = serializer.save(created_by=request.user)
            return Response(
                {
                    "message": "Movie created successfully.",
                    "movie": MovieSerializer(movie).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def put(self, request, pk=None):
        # PUT /api/movies/1/
        error_response = self.require_pk(pk, "PUT")
        if error_response:
            return error_response

        movie = self.get_movie(pk)
        serializer = MovieSerializer(movie, data=request.data)
        if serializer.is_valid():
            updated_movie = serializer.save()
            return Response(
                {
                    "message": "Movie updated successfully.",
                    "movie": MovieSerializer(updated_movie).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, pk=None):
        # PATCH /api/movies/1/
        error_response = self.require_pk(pk, "PATCH")
        if error_response:
            return error_response

        movie = self.get_movie(pk)
        serializer = MovieSerializer(movie, data=request.data, partial=True)
        if serializer.is_valid():
            updated_movie = serializer.save()
            return Response(
                {
                    "message": "Movie updated successfully.",
                    "movie": MovieSerializer(updated_movie).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk=None):
        # DELETE /api/movies/1/
        error_response = self.require_pk(pk, "DELETE")
        if error_response:
            return error_response

        movie = self.get_movie(pk)
        movie_data = MovieSerializer(movie).data
        movie.delete()

        return Response(
            {
                "message": "Movie deleted successfully.",
                "movie": movie_data,
            },
            status=status.HTTP_200_OK,
        )

# =========================
# RATING
# =========================

class RatingApiView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [RatingApiPermission]

    def get_queryset(self):
        return Rating.objects.select_related("user", "movie").all()

    def get_rating(self, request, pk):
        rating = get_object_or_404(self.get_queryset(), pk=pk)
        self.check_object_permissions(request, rating)
        return rating

    def require_pk(self, pk, method_name):
        if pk is None:
            return Response(
                {"error": f"{method_name} requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )
        return None

    def get(self, request, pk=None):
        # GET /api/ratings/                 -> list
        # GET /api/ratings/?movie_id=5      -> filtered list
        # GET /api/ratings/?user_id=3       -> filtered list
        # GET /api/ratings/?username=alice  -> filtered list
        # GET /api/ratings/?score=8         -> filtered list
        # GET /api/ratings/?mine=true       -> current user's ratings
        # GET /api/ratings/1/               -> detail

        if pk is None:
            ratings = self.get_queryset()

            movie_id = request.query_params.get("movie_id")
            if movie_id:
                ratings = ratings.filter(movie_id=movie_id)

            user_id = request.query_params.get("user_id")
            if user_id:
                ratings = ratings.filter(user_id=user_id)

            username = request.query_params.get("username")
            if username:
                ratings = ratings.filter(user__username__icontains=username.strip())

            score = request.query_params.get("score")
            if score:
                ratings = ratings.filter(score=score)

            mine = request.query_params.get("mine")
            if mine and mine.lower() in {"1", "true", "yes"}:
                ratings = ratings.filter(user=request.user)

            serializer = RatingSerializer(ratings, many=True)
            return Response(
                {"ratings": serializer.data},
                status=status.HTTP_200_OK,
            )

        rating = self.get_rating(request, pk)
        serializer = RatingSerializer(rating)

        return Response(
            {"rating": serializer.data},
            status=status.HTTP_200_OK,
        )

    def post(self, request, pk=None):
        # POST /api/ratings/
        if pk is not None:
            return Response(
                {"error": "POST is not allowed on a specific resource URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )

        serializer = RatingSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            rating = serializer.save(user=request.user)
            return Response(
                {
                    "message": "Rating created successfully.",
                    "rating": RatingSerializer(rating).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def put(self, request, pk=None):
        # PUT /api/ratings/1/
        error_response = self.require_pk(pk, "PUT")
        if error_response:
            return error_response

        rating = self.get_rating(request, pk)
        serializer = RatingSerializer(
            rating,
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            updated_rating = serializer.save()
            return Response(
                {
                    "message": "Rating updated successfully.",
                    "rating": RatingSerializer(updated_rating).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, pk=None):
        # PATCH /api/ratings/1/
        error_response = self.require_pk(pk, "PATCH")
        if error_response:
            return error_response

        rating = self.get_rating(request, pk)
        serializer = RatingSerializer(
            rating,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            updated_rating = serializer.save()
            return Response(
                {
                    "message": "Rating updated successfully.",
                    "rating": RatingSerializer(updated_rating).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk=None):
        # DELETE /api/ratings/1/
        error_response = self.require_pk(pk, "DELETE")
        if error_response:
            return error_response

        rating = self.get_rating(request, pk)
        rating_data = RatingSerializer(rating).data
        rating.delete()

        return Response(
            {
                "message": "Rating deleted successfully.",
                "rating": rating_data,
            },
            status=status.HTTP_200_OK,
        )

# =========================
# COMMENT
# =========================

class CommentApiView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CommentApiPermission]

    def get_queryset(self):
        return (
            Comment.objects
            .select_related("user", "movie", "parent")
            .prefetch_related("replies__user", "replies__movie", "replies__parent")
            .all()
        )

    def get_comment(self, request, pk):
        comment = get_object_or_404(self.get_queryset(), pk=pk)
        self.check_object_permissions(request, comment)
        return comment

    def require_pk(self, pk, method_name):
        if pk is None:
            return Response(
                {"error": f"{method_name} requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )
        return None

    def get(self, request, pk=None):
        # GET /api/comments/                         -> list
        # GET /api/comments/?movie_id=5             -> filtered list
        # GET /api/comments/?user_id=3              -> filtered list
        # GET /api/comments/?username=john          -> filtered list
        # GET /api/comments/?parent_id=10           -> replies of one comment
        # GET /api/comments/?root_only=true         -> only top-level comments
        # GET /api/comments/?mine=true              -> current user's comments
        # GET /api/comments/1/                      -> detail

        if pk is None:
            comments = self.get_queryset()

            movie_id = request.query_params.get("movie_id")
            if movie_id:
                comments = comments.filter(movie_id=movie_id)

            user_id = request.query_params.get("user_id")
            if user_id:
                comments = comments.filter(user_id=user_id)

            username = request.query_params.get("username")
            if username:
                comments = comments.filter(user__username__icontains=username.strip())

            parent_id = request.query_params.get("parent_id")
            if parent_id:
                comments = comments.filter(parent_id=parent_id)

            root_only = request.query_params.get("root_only")
            if root_only and root_only.lower() in {"1", "true", "yes"}:
                comments = comments.filter(parent__isnull=True)

            mine = request.query_params.get("mine")
            if mine and mine.lower() in {"1", "true", "yes"}:
                comments = comments.filter(user=request.user)

            serializer = CommentSerializer(
                comments,
                many=True,
                context={"request": request},
            )
            return Response(
                {"comments": serializer.data},
                status=status.HTTP_200_OK,
            )

        comment = self.get_comment(request, pk)
        serializer = CommentSerializer(comment, context={"request": request})
        return Response(
            {"comment": serializer.data},
            status=status.HTTP_200_OK,
        )

    def post(self, request, pk=None):
        # POST /api/comments/
        if pk is not None:
            return Response(
                {"error": "POST is not allowed on a specific resource URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )

        serializer = CommentSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            comment = serializer.save(user=request.user)
            return Response(
                {
                    "message": "Comment created successfully.",
                    "comment": CommentSerializer(
                        comment,
                        context={"request": request},
                    ).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def put(self, request, pk=None):
        # PUT /api/comments/1/
        error_response = self.require_pk(pk, "PUT")
        if error_response:
            return error_response

        comment = self.get_comment(request, pk)
        serializer = CommentSerializer(
            comment,
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            updated_comment = serializer.save()
            return Response(
                {
                    "message": "Comment updated successfully.",
                    "comment": CommentSerializer(
                        updated_comment,
                        context={"request": request},
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, pk=None):
        # PATCH /api/comments/1/
        error_response = self.require_pk(pk, "PATCH")
        if error_response:
            return error_response

        comment = self.get_comment(request, pk)
        serializer = CommentSerializer(
            comment,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            updated_comment = serializer.save()
            return Response(
                {
                    "message": "Comment updated successfully.",
                    "comment": CommentSerializer(
                        updated_comment,
                        context={"request": request},
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk=None):
        # DELETE /api/comments/1/
        error_response = self.require_pk(pk, "DELETE")
        if error_response:
            return error_response

        comment = self.get_comment(request, pk)
        comment_data = CommentSerializer(comment, context={"request": request}).data
        comment.delete()

        return Response(
            {
                "message": "Comment deleted successfully.",
                "comment": comment_data,
            },
            status=status.HTTP_200_OK,
        )

# =========================
# REPORT
# =========================

class ReportApiView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [ReportApiPermission]

    def get_queryset(self):
        return (
            Report.objects
            .select_related("user", "movie", "comment", "reviewed_by")
            .all()
        )

    def get_report(self, request, pk):
        report = get_object_or_404(self.get_queryset(), pk=pk)
        self.check_object_permissions(request, report)
        return report

    def require_pk(self, pk, method_name):
        if pk is None:
            return Response(
                {"error": f"{method_name} requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )
        return None

    def get(self, request, pk=None):
        # GET /api/reports/                        -> list
        # GET /api/reports/?status=PENDING         -> filtered list
        # GET /api/reports/?movie_id=5             -> filtered list
        # GET /api/reports/?comment_id=12          -> filtered list
        # GET /api/reports/?user_id=3              -> filtered list
        # GET /api/reports/?reviewed_by_id=2       -> filtered list
        # GET /api/reports/?mine=true              -> current user's reports
        # GET /api/reports/1/                      -> detail

        if pk is None:
            reports = self.get_queryset()

            status_value = request.query_params.get("status")
            if status_value:
                reports = reports.filter(status=status_value)

            movie_id = request.query_params.get("movie_id")
            if movie_id:
                reports = reports.filter(movie_id=movie_id)

            comment_id = request.query_params.get("comment_id")
            if comment_id:
                reports = reports.filter(comment_id=comment_id)

            user_id = request.query_params.get("user_id")
            if user_id:
                reports = reports.filter(user_id=user_id)

            reviewed_by_id = request.query_params.get("reviewed_by_id")
            if reviewed_by_id:
                reports = reports.filter(reviewed_by_id=reviewed_by_id)

            mine = request.query_params.get("mine")
            if mine and mine.lower() in {"1", "true", "yes"}:
                reports = reports.filter(user=request.user)

            serializer = ReportSerializer(
                reports,
                many=True,
                context={"request": request},
            )
            return Response(
                {"reports": serializer.data},
                status=status.HTTP_200_OK,
            )

        report = self.get_report(request, pk)
        serializer = ReportSerializer(report, context={"request": request})
        return Response(
            {"report": serializer.data},
            status=status.HTTP_200_OK,
        )

    def post(self, request, pk=None):
        # POST /api/reports/
        if pk is not None:
            return Response(
                {"error": "POST is not allowed on a specific resource URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )

        serializer = ReportSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            report = serializer.save(user=request.user)
            return Response(
                {
                    "message": "Report created successfully.",
                    "report": ReportSerializer(
                        report,
                        context={"request": request},
                    ).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def put(self, request, pk=None):
        # PUT /api/reports/1/
        error_response = self.require_pk(pk, "PUT")
        if error_response:
            return error_response

        report = self.get_report(request, pk)
        serializer = ReportSerializer(
            report,
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            updated_report = serializer.save()

            if updated_report.status != Report.Status.PENDING:
                updated_report.reviewed_by = request.user
                updated_report.reviewed_at = timezone.now()
                updated_report.save(update_fields=["reviewed_by", "reviewed_at"])

            return Response(
                {
                    "message": "Report updated successfully.",
                    "report": ReportSerializer(
                        updated_report,
                        context={"request": request},
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, pk=None):
        # PATCH /api/reports/1/
        error_response = self.require_pk(pk, "PATCH")
        if error_response:
            return error_response

        report = self.get_report(request, pk)
        serializer = ReportSerializer(
            report,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            updated_report = serializer.save()

            if "status" in request.data and updated_report.status != Report.Status.PENDING:
                updated_report.reviewed_by = request.user
                updated_report.reviewed_at = timezone.now()
                updated_report.save(update_fields=["reviewed_by", "reviewed_at"])

            return Response(
                {
                    "message": "Report updated successfully.",
                    "report": ReportSerializer(
                        updated_report,
                        context={"request": request},
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk=None):
        # DELETE /api/reports/1/
        error_response = self.require_pk(pk, "DELETE")
        if error_response:
            return error_response

        report = self.get_report(request, pk)
        report_data = ReportSerializer(report, context={"request": request}).data
        report.delete()

        return Response(
            {
                "message": "Report deleted successfully.",
                "report": report_data,
            },
            status=status.HTTP_200_OK,
        )
