from rest_framework.permissions import BasePermission, SAFE_METHODS


class BanApiPermission(BasePermission):
    allow_anonymous_read = False

    perms_map = {
        "GET": "users.view_ban",
        "HEAD": "users.view_ban",
        "POST": "users.add_ban",
        "PUT": "users.change_ban",
        "PATCH": "users.change_ban",
        "DELETE": "users.delete_ban",
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