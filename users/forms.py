from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User, Permission
from django.core.exceptions import ValidationError
from django.forms import TextInput, EmailInput, PasswordInput


class LoginForm(forms.Form):
    username = forms.CharField(label='Username', max_length=150,
                               widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'}))
    password = forms.CharField(label='Password',
                               widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': '********'}))