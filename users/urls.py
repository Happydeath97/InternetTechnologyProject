from django.urls import path
from users import views as users_v
from django.contrib.auth import views as auth_views

urlpatterns = [
    path("register/", users_v.RegistrationView.as_view(), name="register"),
    path("login/", users_v.LoginView.as_view(), name="login"),
    path("logout/", users_v.LogoutView.as_view(), name="logout"),
]