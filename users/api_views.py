from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication

from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Ban
from .permissions import BanApiPermission
from .serializers import BanSerializer


class BanApiView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [BanApiPermission]
    serializer_class = BanSerializer
    queryset = Ban.objects.all()

    def get_queryset(self):
        return (
            Ban.objects
            .select_related("user", "admin")
            .all()
        )

    def get_ban(self, request, pk):
        ban = get_object_or_404(self.get_queryset(), pk=pk)
        self.check_object_permissions(request, ban)
        return ban

    def require_pk(self, pk, method_name):
        if pk is None:
            return Response(
                {"error": f"{method_name} requires a resource id in the URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )
        return None

    def is_truthy(self, value):
        return value and value.lower() in {"1", "true", "yes"}

    def is_falsey(self, value):
        return value and value.lower() in {"0", "false", "no"}

    def get(self, request, pk=None):
        # GET /api/bans/                         -> list
        # GET /api/bans/?status=active           -> filtered list
        # GET /api/bans/?user_id=3               -> filtered list
        # GET /api/bans/?username=john           -> filtered list
        # GET /api/bans/?admin_id=1              -> filtered list
        # GET /api/bans/?admin_username=admin    -> filtered list
        # GET /api/bans/?is_permanent=true       -> filtered list
        # GET /api/bans/?active_now=true         -> currently active bans
        # GET /api/bans/1/                       -> detail

        if pk is None:
            bans = self.get_queryset()

            status_value = request.query_params.get("status")
            if status_value:
                bans = bans.filter(status=status_value)

            user_id = request.query_params.get("user_id")
            if user_id:
                bans = bans.filter(user_id=user_id)

            username = request.query_params.get("username")
            if username:
                bans = bans.filter(user__username__icontains=username.strip())

            admin_id = request.query_params.get("admin_id")
            if admin_id:
                bans = bans.filter(admin_id=admin_id)

            admin_username = request.query_params.get("admin_username")
            if admin_username:
                bans = bans.filter(admin__username__icontains=admin_username.strip())

            is_permanent = request.query_params.get("is_permanent")
            if self.is_truthy(is_permanent):
                bans = bans.filter(is_permanent=True)
            elif self.is_falsey(is_permanent):
                bans = bans.filter(is_permanent=False)

            active_now = request.query_params.get("active_now")
            if active_now:
                now = timezone.now()
                active_query = (
                    Q(status=Ban.Status.ACTIVE)
                    & (
                        Q(is_permanent=True)
                        | Q(end_date__isnull=True)
                        | Q(end_date__gt=now)
                    )
                )

                if self.is_truthy(active_now):
                    bans = bans.filter(active_query)
                elif self.is_falsey(active_now):
                    bans = bans.exclude(active_query)

            serializer = BanSerializer(
                bans,
                many=True,
                context={"request": request},
            )
            return Response(
                {"bans": serializer.data},
                status=status.HTTP_200_OK,
            )

        ban = self.get_ban(request, pk)
        serializer = BanSerializer(ban, context={"request": request})

        return Response(
            {"ban": serializer.data},
            status=status.HTTP_200_OK,
        )

    def post(self, request, pk=None):
        # POST /api/bans/
        if pk is not None:
            return Response(
                {"error": "POST is not allowed on a specific resource URL."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )

        serializer = BanSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            ban = serializer.save(admin=request.user)
            return Response(
                {
                    "message": "Ban created successfully.",
                    "ban": BanSerializer(
                        ban,
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
        # PUT /api/bans/1/
        error_response = self.require_pk(pk, "PUT")
        if error_response:
            return error_response

        ban = self.get_ban(request, pk)
        serializer = BanSerializer(
            ban,
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            updated_ban = serializer.save()
            return Response(
                {
                    "message": "Ban updated successfully.",
                    "ban": BanSerializer(
                        updated_ban,
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
        # PATCH /api/bans/1/
        error_response = self.require_pk(pk, "PATCH")
        if error_response:
            return error_response

        ban = self.get_ban(request, pk)
        serializer = BanSerializer(
            ban,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            updated_ban = serializer.save()
            return Response(
                {
                    "message": "Ban updated successfully.",
                    "ban": BanSerializer(
                        updated_ban,
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
        # DELETE /api/bans/1/
        error_response = self.require_pk(pk, "DELETE")
        if error_response:
            return error_response

        ban = self.get_ban(request, pk)
        ban_data = BanSerializer(ban, context={"request": request}).data
        ban.delete()

        return Response(
            {
                "message": "Ban deleted successfully.",
                "ban": ban_data,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema_view(
    get=extend_schema(tags=["bans"], operation_id="listBans"),
    post=extend_schema(tags=["bans"], operation_id="createBan"),
)
class BanListApiView(BanApiView):
    http_method_names = ["get", "post", "head", "options"]


@extend_schema_view(
    get=extend_schema(tags=["bans"], operation_id="getBan"),
    put=extend_schema(tags=["bans"], operation_id="replaceBan"),
    patch=extend_schema(tags=["bans"], operation_id="partialUpdateBan"),
    delete=extend_schema(tags=["bans"], operation_id="deleteBan"),
)
class BanDetailApiView(BanApiView):
    http_method_names = ["get", "put", "patch", "delete", "head", "options"]
