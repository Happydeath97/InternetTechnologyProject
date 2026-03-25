from django.shortcuts import render
from django.views import View


class IndexView(View):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        return render(request, "movies/index.html")
