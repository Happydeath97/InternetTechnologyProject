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

    def clean(self):
        cleaned_data = super().clean()
        full_name = cleaned_data.get("full_name")
        date_of_birth = cleaned_data.get("date_of_birth")

        if not full_name:
            return cleaned_data

        queryset = Author.objects.filter(
            full_name=full_name,
            date_of_birth=date_of_birth
        )

        if self.instance.pk:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise forms.ValidationError(
                "Author with this full name and date of birth already exists."
            )

        return cleaned_data


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
