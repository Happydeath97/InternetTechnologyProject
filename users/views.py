# Create your views here.
from django.shortcuts import render, redirect
from django.views import View
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy

from .forms import LoginForm, RegistrationForm


class RegistrationView(View):
    http_method_names = ['get', 'post']

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('index')

        form = RegistrationForm()
        return render(request, 'users/register.html', {'form': form})

    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('index')

        form = RegistrationForm(request.POST)

        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Account created successfully.')
            return redirect('index')

        messages.error(request, 'Please correct the errors below.')
        return render(request, 'users/register.html', {'form': form})


class LoginView(View):
    http_method_names = ['get', 'post']

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('index')

        form = LoginForm()
        return render(request, 'users/login.html', {'form': form})

    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('index')

        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, 'Logged in successfully.')
                return redirect('index')
            else:
                messages.error(request, 'Invalid username or password.')
        return render(request, 'users/login.html', {'form': form})


class LogoutView(LoginRequiredMixin, View):
    login_url = '/login/'
    redirect_field_name = 'next'
    http_method_names = ['post']

    def post(self, request, *args, **kwargs):
        logout(request)
        return redirect('login')
