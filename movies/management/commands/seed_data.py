from datetime import date, timedelta
import random

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.utils import timezone

from movies.models import Genre, Author, Movie, Rating, Comment, Report
from users.models import Ban


class Command(BaseCommand):
    help = "Populate the database with demo data for development and testing."

    def handle(self, *args, **options):
        User = get_user_model()
        default_password = "admin"

        self.stdout.write("Seeding demo data...")

        # ------------------------------------------------------------------
        # 1. Ensure there is at least one superuser
        # ------------------------------------------------------------------
        if not User.objects.filter(is_superuser=True).exists():
            admin_user = User.objects.create_superuser(
                username="admin_super",
                email="",
                password="admin",
            )
            self.stdout.write(
                self.style.SUCCESS(
                    "Created superuser: username='admin', password='admin'"
                )
            )
        else:
            admin_user = User.objects.filter(is_superuser=True).first()
            self.stdout.write("Superuser already exists.")

        # ------------------------------------------------------------------
        # 2. Create demo users and assign groups
        # ------------------------------------------------------------------
        demo_users_data = [
            {"username": "user_demo", "group": "User"},
            {"username": "editor_demo", "group": "Editor"},
            {"username": "admin_demo", "group": "Admin"},
        ]

        demo_users = {}

        for item in demo_users_data:
            user, created = User.objects.get_or_create(
                username=item["username"],
                defaults={"email": ""}
            )
            user.set_password(default_password)
            user.save()

            group = Group.objects.filter(name=item["group"]).first()
            if group:
                user.groups.add(group)

            demo_users[item["username"]] = user

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created demo user: {item['username']}")
                )
            else:
                self.stdout.write(f"Demo user already exists: {item['username']}")

        # ------------------------------------------------------------------
        # 3. Create genres
        # ------------------------------------------------------------------
        genre_names = [
            "action",
            "adventure",
            "animation",
            "comedy",
            "crime",
            "drama",
            "fantasy",
            "horror",
            "romance",
            "sci-fi",
            "thriller",
        ]

        genres = []
        for name in genre_names:
            genre, _ = Genre.objects.get_or_create(name=name)
            genres.append(genre)

        self.stdout.write(self.style.SUCCESS(f"Prepared {len(genres)} genres."))

        # ------------------------------------------------------------------
        # 4. Create authors
        # ------------------------------------------------------------------
        author_data = [
            ("christopher nolan", date(1970, 7, 30)),
            ("quentin tarantino", date(1963, 3, 27)),
            ("greta gerwig", date(1983, 8, 4)),
            ("denis villeneuve", date(1967, 10, 3)),
            ("sofia coppola", date(1971, 5, 14)),
            ("martin scorsese", date(1942, 11, 17)),
            ("patty jenkins", date(1971, 7, 24)),
            ("bong joon-ho", date(1969, 9, 14)),
        ]

        authors = []
        for full_name, dob in author_data:
            author, _ = Author.objects.get_or_create(
                full_name=full_name,
                date_of_birth=dob
            )
            authors.append(author)

        self.stdout.write(self.style.SUCCESS(f"Prepared {len(authors)} authors."))

        # ------------------------------------------------------------------
        # 5. Create movies
        # ------------------------------------------------------------------
        movie_data = [
            {
                "title": "Inception",
                "description": "A thief enters dreams to steal secrets and plant ideas.",
                "release_year": 2010,
            },
            {
                "title": "Pulp Fiction",
                "description": "Several criminal stories intertwine in Los Angeles.",
                "release_year": 1994,
            },
            {
                "title": "Barbie",
                "description": "Barbie leaves Barbieland and discovers the real world.",
                "release_year": 2023,
            },
            {
                "title": "Dune",
                "description": "A young nobleman faces destiny on the desert planet Arrakis.",
                "release_year": 2021,
            },
            {
                "title": "Parasite",
                "description": "A poor family slowly infiltrates a wealthy household.",
                "release_year": 2019,
            },
            {
                "title": "Wonder Woman",
                "description": "An Amazon warrior leaves her island to stop a great war.",
                "release_year": 2017,
            },
        ]

        movies = []
        creator = demo_users["editor_demo"]

        for item in movie_data:
            movie, created = Movie.objects.get_or_create(
                title=item["title"],
                defaults={
                    "description": item["description"],
                    "release_year": item["release_year"],
                    "created_by": creator,
                }
            )

            # Keep movie data aligned even if movie already exists
            movie.description = item["description"]
            movie.release_year = item["release_year"]
            movie.created_by = creator
            movie.save()

            # Re-assign demo M2M data so reruns stay consistent
            movie.genre.set(random.sample(genres, k=random.randint(1, 3)))
            movie.author.set(random.sample(authors, k=random.randint(1, 2)))

            movies.append(movie)

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created movie: {movie.title}"))
            else:
                self.stdout.write(f"Updated movie: {movie.title}")

        # ------------------------------------------------------------------
        # 6. Create ratings
        # ------------------------------------------------------------------
        rating_users = [
            demo_users["user_demo"],
            demo_users["editor_demo"],
            demo_users["admin_demo"],
            admin_user,
        ]

        for movie in movies:
            for user in rating_users:
                Rating.objects.update_or_create(
                    user=user,
                    movie=movie,
                    defaults={"score": random.randint(6, 10)}
                )

        self.stdout.write(self.style.SUCCESS("Ratings prepared."))

        # ------------------------------------------------------------------
        # 7. Create comments and nested replies
        # ------------------------------------------------------------------
        comment_templates = [
            "I really liked this movie.",
            "The pacing was good and the story kept my attention.",
            "Interesting concept, but some parts felt slow.",
            "Strong visuals and memorable scenes.",
            "This is one I would watch again.",
        ]

        reply_templates = [
            "I agree with your point.",
            "Not sure I see it that way.",
            "That is fair, but I liked it more.",
            "Interesting take.",
            "I had a similar impression.",
        ]

        for movie in movies:
            root_comments = []

            for index, user in enumerate(rating_users[:3], start=1):
                content = f"{comment_templates[index % len(comment_templates)]} ({movie.title})"

                comment, _ = Comment.objects.get_or_create(
                    user=user,
                    movie=movie,
                    parent=None,
                    content=content,
                )
                root_comments.append(comment)

            for index, root_comment in enumerate(root_comments, start=1):
                first_reply_user = rating_users[index % len(rating_users)]
                first_reply_text = f"{reply_templates[index % len(reply_templates)]} Reply to '{root_comment.movie.title}'."

                first_reply, _ = Comment.objects.get_or_create(
                    user=first_reply_user,
                    movie=movie,
                    parent=root_comment,
                    content=first_reply_text,
                )

                second_reply_user = rating_users[(index + 1) % len(rating_users)]
                second_reply_text = f"Nested reply example under '{root_comment.movie.title}'."

                Comment.objects.get_or_create(
                    user=second_reply_user,
                    movie=movie,
                    parent=first_reply,
                    content=second_reply_text,
                )

        self.stdout.write(self.style.SUCCESS("Comments and nested replies prepared."))

        # ------------------------------------------------------------------
        # 8. Create reports
        # ------------------------------------------------------------------
        sample_movie = movies[0]
        sample_comment = Comment.objects.filter(movie=sample_movie).first()

        Report.objects.get_or_create(
            user=demo_users["user_demo"],
            movie=sample_movie,
            comment=None,
            reason="This movie entry contains questionable information.",
            defaults={
                "status": Report.Status.PENDING,
            }
        )

        if sample_comment:
            Report.objects.get_or_create(
                user=demo_users["editor_demo"],
                movie=None,
                comment=sample_comment,
                reason="This comment may be inappropriate.",
                defaults={
                    "status": Report.Status.REVIEWED,
                    "reviewed_by": demo_users["admin_demo"],
                    "reviewed_at": timezone.now(),
                }
            )

        self.stdout.write(self.style.SUCCESS("Reports prepared."))

        # ------------------------------------------------------------------
        # 9. Create one demo ban
        # ------------------------------------------------------------------
        Ban.objects.get_or_create(
            user=demo_users["user_demo"],
            admin=demo_users["admin_demo"],
            reason="Temporary demo ban for testing purposes.",
            defaults={
                "start_date": timezone.now(),
                "end_date": timezone.now() + timedelta(days=7),
                "is_permanent": False,
                "status": Ban.Status.ACTIVE,
            }
        )

        self.stdout.write(self.style.SUCCESS("Ban prepared."))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Demo data seeding completed successfully."))
        self.stdout.write("Demo users:")
        self.stdout.write("  superuser -> username: admin / password: admin")
        self.stdout.write("  user      -> username: user_demo / password: admin")
        self.stdout.write("  editor    -> username: editor_demo / password: admin")
        self.stdout.write("  admin     -> username: admin_demo / password: admin")
