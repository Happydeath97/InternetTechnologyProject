from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin,  PermissionRequiredMixin
from django.shortcuts import get_object_or_404, redirect, render
from django.db.models import Avg
from django.urls import reverse_lazy
from django.views.generic import UpdateView
from django.http import JsonResponse

from .forms import AuthorForm, GenreForm, MovieForm
from .models import Movie, Genre, Author, Rating


class AuthorListApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    # TODO: add filter and pagination
    http_method_names = ["get"]
    permission_required = "movies.view_author"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        authors = Author.objects.all()

        data = {
            "authors": [
                {
                    "id": author.id,
                    "full_name": author.full_name,
                    "date_of_birth": author.date_of_birth
                }
                for author in authors
            ]
        }

        return JsonResponse(data, status=200)


class AuthorCreateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = ["movies.add_author"]

    def post(self, request, *args, **kwargs):
        form = AuthorForm(request.POST)

        if form.is_valid():
            author = form.save()
            return JsonResponse(
                {
                    "message": "Author created successfully.",
                    "author": {
                        "id": author.id,
                        "full_name": author.full_name,
                    }
                },
                status=201
            )

        return JsonResponse(
            {
                "errors": form.errors,
            },
            status=400
        )


class AuthorDetailApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["get"]
    permission_required = "movies.view_author"
    raise_exception = True

    def get(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)

        data = {
            "author": {
                "id": author.id,
                "full_name": author.full_name,
                "date_of_birth": author.date_of_birth,
            }
        }

        return JsonResponse(data, status=200)


class AuthorUpdateApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["post"]
    permission_required = "movies.change_author"
    raise_exception = True

    def post(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)
        form = AuthorForm(request.POST, instance=author)

        if form.is_valid():
            updated_author = form.save()
            return JsonResponse(
                {
                    "message": "Author updated successfully.",
                    "author": {
                        "id": updated_author.id,
                        "full_name": updated_author.full_name,
                        "date_of_birth": updated_author.date_of_birth,
                    }
                },
                status=200
            )

        return JsonResponse(
            {
                "errors": form.errors,
            },
            status=400
        )


class AuthorDeleteApiView(LoginRequiredMixin, PermissionRequiredMixin, View):
    http_method_names = ["delete"]
    permission_required = "movies.delete_author"
    raise_exception = True

    def delete(self, request, pk, *args, **kwargs):
        author = get_object_or_404(Author, pk=pk)
        author.delete()

        return JsonResponse(
            {
                "message": "Author deleted successfully."
            },
            status=200
        )
