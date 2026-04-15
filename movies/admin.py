from django.contrib import admin
from .models import Genre, Author, Movie, Rating, Comment, Report


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'date_of_birth')
    search_fields = ('full_name',)
    ordering = ('full_name',)


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'display_genres',
        'display_authors',
        'created_by',
        'release_year',
        'created_at',
    )
    list_filter = ('genre', 'author', 'release_year', 'created_at')
    search_fields = ('title', 'description', 'author__full_name', 'genre__name')
    ordering = ('title',)
    filter_horizontal = ('genre', 'author')

    def display_genres(self, obj):
        return ", ".join(genre.name for genre in obj.genre.all())
    display_genres.short_description = 'Genres'

    def display_authors(self, obj):
        return ", ".join(author.full_name for author in obj.author.all())
    display_authors.short_description = 'Authors'


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'movie', 'score', 'created_at')
    list_filter = ('score', 'created_at')
    search_fields = ('user__username', 'movie__title')
    ordering = ('-created_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'movie', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'movie__title', 'content')
    ordering = ('-created_at',)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'movie',
        'comment',
        'status',
        'reviewed_by',
        'created_at',
        'reviewed_at',
    )
    list_filter = ('status', 'created_at', 'reviewed_at')
    search_fields = (
        'user__username',
        'movie__title',
        'comment__content',
        'reviewed_by__username',
        'reason',
    )
    ordering = ('-created_at',)