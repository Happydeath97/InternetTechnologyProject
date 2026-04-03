from django import forms
from .models import Movie, Genre, Author


class GenreForm(forms.ModelForm):
    class Meta:
        model = Genre
        fields = ['name']

    def clean_name(self):
        name = self.cleaned_data['name'].strip().lower()
        return name


class AuthorForm(forms.ModelForm):
    class Meta:
        model = Author
        fields = ['full_name', 'date_of_birth']

    def clean_full_name(self):
        full_name = self.cleaned_data['full_name'].strip().lower()
        return full_name


class MovieForm(forms.ModelForm):
    class Meta:
        model = Movie
        fields = ['genre', 'author', 'title', 'description', 'release_year']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 5}),
        }

    def clean_release_year(self):
        release_year = self.cleaned_data['release_year']

        if release_year < 1888:
            raise forms.ValidationError("Release year must be 1888 or later.")

        return release_year
