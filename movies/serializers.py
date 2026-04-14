from rest_framework import serializers

from .models import Author, Genre, Movie, Rating, Comment


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ["id", "full_name", "date_of_birth"]


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]


class MovieDetailSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(source="author", many=True, read_only=True)
    genres = GenreSerializer(source="genre", many=True, read_only=True)

    class Meta:
        model = Movie
        fields = ["id", "title", "description", "release_year", "authors", "genres"]


class MovieSerializer(serializers.ModelSerializer):
    authors = serializers.SerializerMethodField()
    genres = serializers.SerializerMethodField()
    created_by = serializers.CharField(source="created_by.username", read_only=True)
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "release_year",
            "authors",
            "genres",
            "created_by",
            "avg_rating",
            "created_at",
            "updated_at",
        ]

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
        if obj.avg_rating is None:
            return None
        return round(float(obj.avg_rating), 1)


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ["id", "score"]


class RatingVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ["score"]

    def validate_score(self, value):
        if value < 1 or value > 10:
            raise serializers.ValidationError("Score must be between 1 and 10.")
        return value


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "content", "user", "created_at", "updated_at", "replies"]

    def get_replies(self, obj):
        replies = obj.replies.all().select_related("user").order_by("created_at")
        return CommentSerializer(replies, many=True).data