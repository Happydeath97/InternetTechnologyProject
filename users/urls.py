from django.urls import path
from users import views as users_v
from .api_views import BanListApiView, BanDetailApiView

urlpatterns = [
    # =========================================================
    # NON-API PAGES
    # =========================================================

    path("register/", users_v.RegistrationView.as_view(), name="register"),
    path("login/", users_v.LoginView.as_view(), name="login"),
    path("logout/", users_v.LogoutView.as_view(), name="logout"),

    # =========================================================
    # API ENDPOINTS
    # =========================================================

    # -------------------------
    # Ban API
    # -------------------------
    path("api/bans/", BanListApiView.as_view(), name="ban_api"),
    path("api/bans/<int:pk>/", BanDetailApiView.as_view(), name="ban_detail_api"),
]