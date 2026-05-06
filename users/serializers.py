from builtins import bool

from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from .models import Ban


User = get_user_model()


class BanSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    admin = serializers.SerializerMethodField(read_only=True)

    user_id = serializers.PrimaryKeyRelatedField(
        source="user",
        queryset=User.objects.all(),
        write_only=True,
        required=False,
    )

    start_date = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M",
        required=False,
    )
    end_date = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M",
        required=False,
        allow_null=True,
    )
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    is_active = serializers.SerializerMethodField(read_only=True)
    can_update = serializers.SerializerMethodField(read_only=True)
    can_delete = serializers.SerializerMethodField(read_only=True)
    can_revoke = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Ban
        fields = [
            "id",
            "user",
            "user_id",
            "admin",
            "reason",
            "start_date",
            "end_date",
            "is_permanent",
            "status",
            "is_active",
            "created_at",
            "updated_at",
            "can_update",
            "can_delete",
            "can_revoke",
        ]
        read_only_fields = [
            "id",
            "user",
            "admin",
            "is_active",
            "created_at",
            "updated_at",
            "can_update",
            "can_delete",
            "can_revoke",
        ]

    @extend_schema_field(serializers.DictField())
    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
        }

    @extend_schema_field(serializers.DictField())
    def get_admin(self, obj):
        return {
            "id": obj.admin.id,
            "username": obj.admin.username,
        }

    def get_is_active(self, obj) -> bool:
        return obj.is_active_now()

    def get_can_update(self, obj) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return user.has_perm("users.change_ban")

    def get_can_delete(self, obj) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return user.has_perm("users.delete_ban")

    def get_can_revoke(self, obj) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return (
            user.has_perm("users.change_ban")
            and obj.status == Ban.Status.ACTIVE
        )

    def validate_reason(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Ban reason cannot be empty.")

        return value

    def validate_status(self, value):
        allowed_statuses = {choice[0] for choice in Ban.Status.choices}

        if value not in allowed_statuses:
            raise serializers.ValidationError("Invalid ban status.")

        return value

    def validate(self, attrs):
        request = self.context.get("request")
        admin = getattr(request, "user", None)

        target_user = attrs.get("user")

        if self.instance is None:
            if target_user is None:
                raise serializers.ValidationError(
                    {"user_id": "This field is required."}
                )
        else:
            if target_user is not None and target_user != self.instance.user:
                raise serializers.ValidationError(
                    {"user_id": "Changing the banned user is not allowed."}
                )

            target_user = self.instance.user

        if admin and admin.is_authenticated and target_user == admin:
            raise serializers.ValidationError(
                {"user_id": "An admin cannot ban themselves."}
            )

        is_permanent = attrs.get(
            "is_permanent",
            self.instance.is_permanent if self.instance else False,
        )
        start_date = attrs.get(
            "start_date",
            self.instance.start_date if self.instance else timezone.now(),
        )
        end_date = attrs.get(
            "end_date",
            self.instance.end_date if self.instance else None,
        )

        if is_permanent and end_date is not None:
            raise serializers.ValidationError(
                {"end_date": "Permanent bans must not have an end date."}
            )

        if not is_permanent and end_date is not None and end_date <= start_date:
            raise serializers.ValidationError(
                {"end_date": "End date must be later than start date."}
            )

        return attrs