from django.apps import AppConfig


class MoviesConfig(AppConfig):
    name = 'movies'
    default_auto_field = "django.db.models.BigAutoField"

    def ready(self):
        import movies.signals
