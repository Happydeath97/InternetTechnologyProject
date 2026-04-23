from rest_framework.permissions import BasePermission, SAFE_METHODS


class AuthorApiPermission(BasePermission):
    """
    Uses vanilla Django permissions.
    Groups are handled automatically through request.user.has_perm(...).
    """

    allow_anonymous_read = False

    perms_map = {
        "GET": "movies.view_author",
        "HEAD": "movies.view_author",
        "POST": "movies.add_author",
        "PUT": "movies.change_author",
        "PATCH": "movies.change_author",
        "DELETE": "movies.delete_author",
    }

    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True

        required_perm = self.perms_map.get(request.method)
        if required_perm is None:
            return False

        if request.method in SAFE_METHODS and self.allow_anonymous_read:
            return True

        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.has_perm(required_perm)
        )

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class GenreApiPermission(BasePermission):
    allow_anonymous_read = False

    perms_map = {
        "GET": "movies.view_genre",
        "HEAD": "movies.view_genre",
        "POST": "movies.add_genre",
        "PUT": "movies.change_genre",
        "PATCH": "movies.change_genre",
        "DELETE": "movies.delete_genre",
    }

    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True

        required_perm = self.perms_map.get(request.method)
        if required_perm is None:
            return False

        if request.method in SAFE_METHODS and self.allow_anonymous_read:
            return True

        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.has_perm(required_perm)
        )

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class MovieApiPermission(BasePermission):
    allow_anonymous_read = True

    perms_map = {
        "GET": "movies.view_movie",
        "HEAD": "movies.view_movie",
        "POST": "movies.add_movie",
        "PUT": "movies.change_movie",
        "PATCH": "movies.change_movie",
        "DELETE": "movies.delete_movie",
    }

    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True

        required_perm = self.perms_map.get(request.method)
        if required_perm is None:
            return False

        if request.method in SAFE_METHODS and self.allow_anonymous_read:
            return True

        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.has_perm(required_perm)
        )

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class RatingApiPermission(BasePermission):
    allow_anonymous_read = False   # change to True if guests should read ratings

    perms_map = {
        "GET": "movies.view_rating",
        "HEAD": "movies.view_rating",
        "POST": "movies.add_rating",
        "PUT": "movies.change_rating",
        "PATCH": "movies.change_rating",
        "DELETE": "movies.delete_rating",
    }

    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True

        required_perm = self.perms_map.get(request.method)
        if required_perm is None:
            return False

        if request.method in SAFE_METHODS and self.allow_anonymous_read:
            return True

        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.has_perm(required_perm)
        )

    def has_object_permission(self, request, view, obj):
        user = request.user

        # read access
        if request.method in SAFE_METHODS:
            return user.has_perm("movies.view_rating")

        # update/delete only own rating
        if request.method in {"PUT", "PATCH", "DELETE"}:
            return (
                user.has_perm(self.perms_map[request.method])
                and obj.user == user
            )

        return True


class CommentApiPermission(BasePermission):
    allow_anonymous_read = False

    perms_map = {
        "GET": "movies.view_comment",
        "HEAD": "movies.view_comment",
        "POST": "movies.add_comment",
        "PUT": "movies.change_comment",
        "PATCH": "movies.change_comment",
        "DELETE": "movies.delete_comment",
    }

    def _is_admin_group(self, user):
        return user.is_superuser or user.groups.filter(name="Admin").exists()

    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True

        required_perm = self.perms_map.get(request.method)
        if required_perm is None:
            return False

        if request.method in SAFE_METHODS and self.allow_anonymous_read:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        return user.has_perm(required_perm)

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # detail GET / HEAD
        if request.method in SAFE_METHODS:
            return user.has_perm("movies.view_comment")

        # create has no object yet, so this is not really used for POST
        if request.method == "POST":
            return user.has_perm("movies.add_comment")

        # only owner can edit
        if request.method in {"PUT", "PATCH"}:
            return (
                user.has_perm("movies.change_comment")
                and obj.user_id == user.id
            )

        # owner can delete own comment
        # Admin group can delete any comment
        if request.method == "DELETE":
            return (
                user.has_perm("movies.delete_comment")
                and (
                    obj.user_id == user.id
                    or self._is_admin_group(user)
                )
            )

        return False


class ReportApiPermission(BasePermission):
    allow_anonymous_read = False

    perms_map = {
        "GET": "movies.view_report",
        "HEAD": "movies.view_report",
        "POST": "movies.add_report",
        "PUT": "movies.change_report",
        "PATCH": "movies.change_report",
        "DELETE": "movies.delete_report",
    }

    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True

        required_perm = self.perms_map.get(request.method)
        if required_perm is None:
            return False

        if request.method in SAFE_METHODS and self.allow_anonymous_read:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        return user.has_perm(required_perm)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        required_perm = self.perms_map.get(request.method)
        if required_perm is None:
            return False

        if request.method in SAFE_METHODS and self.allow_anonymous_read:
            return True

        return user.has_perm(required_perm)
