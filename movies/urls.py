from django.urls import path
from movies import views as movies_v

urlpatterns = [
    path("", movies_v.IndexView.as_view(), name="index"),
]