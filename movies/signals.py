from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import Movie


@receiver(post_delete, sender=Movie)
def delete_movie_image_on_delete(sender, instance, **kwargs):
    """
    Delete movie image file from storage when the Movie object is deleted.
    """
    if instance.image:
        instance.image.delete(save=False)


@receiver(pre_save, sender=Movie)
def delete_old_movie_image_on_update(sender, instance, **kwargs):
    """
    Delete the old movie image file when a new image is uploaded.
    """
    if not instance.pk:
        return

    try:
        old_movie = Movie.objects.get(pk=instance.pk)
    except Movie.DoesNotExist:
        return

    old_image = old_movie.image
    new_image = instance.image

    if old_image and old_image != new_image:
        old_image.delete(save=False)