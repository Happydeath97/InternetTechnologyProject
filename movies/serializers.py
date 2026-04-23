from rest_framework import serializers

from django.db.models import Avg

from .models import Author, Genre, Movie, Rating, Comment, Report


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ["id", "full_name", "date_of_birth"]

    def validate_full_name(self, value):
        value = value.strip().lower()

        if not value:
            raise serializers.ValidationError("Full name cannot be empty.")

        return value


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]

    def validate_name(self, value):
        value = value.strip().lower()

        if not value:
            raise serializers.ValidationError("Genre name cannot be empty.")

        return value


class MovieSerializer(serializers.ModelSerializer):
    authors = serializers.SerializerMethodField(read_only=True)
    genres = serializers.SerializerMethodField(read_only=True)
    avg_rating = serializers.SerializerMethodField(read_only=True)
    can_report = serializers.SerializerMethodField(read_only=True)

    author_ids = serializers.PrimaryKeyRelatedField(
        source="author",
        queryset=Author.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )
    genre_ids = serializers.PrimaryKeyRelatedField(
        source="genre",
        queryset=Genre.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    created_by = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "description",
            "release_year",
            "authors",
            "genres",
            "author_ids",
            "genre_ids",
            "created_by",
            "avg_rating",
            "can_report",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "avg_rating",
            "can_report",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_description(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Description cannot be empty.")
        return value

    def get_authors(self, obj):
        return [
            {
                "id": author.id,
                "full_name": author.full_name,
            }
            for author in obj.author.all()
        ]

    def get_genres(self, obj):
        return [
            {
                "id": genre.id,
                "name": genre.name,
            }
            for genre in obj.genre.all()
        ]

    def get_avg_rating(self, obj):
        avg = getattr(obj, "avg_rating", None)

        if avg is None:
            avg = obj.ratings.aggregate(avg=Avg("score"))["avg"]

        if avg is None:
            return None

        return round(float(avg), 1)

    def get_can_report(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return user.has_perm("movies.add_report")

    def create(self, validated_data):
        authors = validated_data.pop("author", [])
        genres = validated_data.pop("genre", [])

        movie = Movie.objects.create(**validated_data)
        movie.author.set(authors)
        movie.genre.set(genres)

        return movie

    def update(self, instance, validated_data):
        authors = validated_data.pop("author", None)
        genres = validated_data.pop("genre", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if authors is not None:
            instance.author.set(authors)

        if genres is not None:
            instance.genre.set(genres)

        return instance


class RatingSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    movie = serializers.SerializerMethodField(read_only=True)
    movie_id = serializers.PrimaryKeyRelatedField(
        source="movie",
        queryset=Movie.objects.all(),
        write_only=True,
        required=False,
    )
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Rating
        fields = [
            "id",
            "user",
            "movie",
            "movie_id",
            "score",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "movie",
            "created_at",
            "updated_at",
        ]

    def get_movie(self, obj):
        return {
            "id": obj.movie.id,
            "title": obj.movie.title,
        }

    def validate_score(self, value):
        if value < 1 or value > 10:
            raise serializers.ValidationError("Score must be between 1 and 10.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        movie = attrs.get("movie")

        if self.instance is None and movie is None:
            raise serializers.ValidationError(
                {"movie_id": "This field is required."}
            )

        if self.instance is not None and movie is not None and movie != self.instance.movie:
            raise serializers.ValidationError(
                {"movie_id": "Changing the movie of an existing rating is not allowed."}
            )

        effective_movie = movie or getattr(self.instance, "movie", None)

        if self.instance is None:
            effective_user = request.user if request and request.user.is_authenticated else None
        else:
            effective_user = self.instance.user

        if effective_user and effective_movie:
            qs = Rating.objects.filter(user=effective_user, movie=effective_movie)

            if self.instance is not None:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                raise serializers.ValidationError(
                    {"movie_id": "You already rated this movie."}
                )

        return attrs


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    replies = serializers.SerializerMethodField()

    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_report = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "content",
            "user",
            "created_at",
            "updated_at",
            "replies",
            "can_edit",
            "can_delete",
            "can_report",
        ]

    def _is_admin_group(self, user):
        return user.is_superuser or user.groups.filter(name="Admin").exists()

    def get_can_edit(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return (
            user.has_perm("movies.change_comment")
            and obj.user_id == user.id
        )

    def get_can_delete(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return (
            user.has_perm("movies.delete_comment")
            and (
                obj.user_id == user.id
                or self._is_admin_group(user)
            )
        )

    def get_can_report(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return user.has_perm("movies.add_report")

    def get_replies(self, obj):
        replies = obj.replies.all().select_related("user").order_by("created_at")
        return CommentSerializer(replies, many=True, context=self.context).data


class ReportSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    reviewed_by = serializers.CharField(source="reviewed_by.username", read_only=True)

    movie = serializers.SerializerMethodField(read_only=True)
    comment = serializers.SerializerMethodField(read_only=True)

    movie_id = serializers.PrimaryKeyRelatedField(
        source="movie",
        queryset=Movie.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    comment_id = serializers.PrimaryKeyRelatedField(
        source="comment",
        queryset=Comment.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    reviewed_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    can_update = serializers.SerializerMethodField(read_only=True)
    can_delete = serializers.SerializerMethodField(read_only=True)
    can_resolve = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "user",
            "movie",
            "comment",
            "movie_id",
            "comment_id",
            "reason",
            "status",
            "reviewed_by",
            "created_at",
            "reviewed_at",
            "can_update",
            "can_delete",
            "can_resolve",
        ]
        read_only_fields = [
            "id",
            "user",
            "movie",
            "comment",
            "reviewed_by",
            "created_at",
            "reviewed_at",
            "can_update",
            "can_delete",
            "can_resolve",
        ]

    def get_movie(self, obj):
        if obj.movie is None:
            return None

        return {
            "id": obj.movie.id,
            "title": obj.movie.title,
        }

    def get_comment(self, obj):
        if obj.comment is None:
            return None

        return {
            "id": obj.comment.id,
            "content": obj.comment.content,
            "movie_id": obj.comment.movie_id,
        }

    def _is_admin_group(self, user):
        return user.is_superuser or user.groups.filter(name="Admin").exists()

    def get_can_update(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return user.has_perm("movies.change_report")

    def get_can_delete(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return user.has_perm("movies.delete_report")

    def get_can_resolve(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return user.has_perm("movies.change_report")

    def validate_reason(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Report reason cannot be empty.")

        return value

    def validate_status(self, value):
        allowed_statuses = {choice[0] for choice in Report.Status.choices}
        if value not in allowed_statuses:
            raise serializers.ValidationError("Invalid report status.")
        return value

    def validate(self, attrs):
        movie = attrs.get("movie")
        comment = attrs.get("comment")

        # CREATE: exactly one target must be provided
        if self.instance is None:
            if movie is None and comment is None:
                raise serializers.ValidationError(
                    {"target": "You must provide either movie_id or comment_id."}
                )

            if movie is not None and comment is not None:
                raise serializers.ValidationError(
                    {"target": "Provide only one target: movie_id or comment_id."}
                )

        # UPDATE: do not allow changing the target
        if self.instance is not None:
            if movie is not None and movie != self.instance.movie:
                raise serializers.ValidationError(
                    {"movie_id": "Changing the movie of an existing report is not allowed."}
                )

            if comment is not None and comment != self.instance.comment:
                raise serializers.ValidationError(
                    {"comment_id": "Changing the comment of an existing report is not allowed."}
                )

        return attrs
