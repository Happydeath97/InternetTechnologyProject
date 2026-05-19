import uuid


def movie_image_upload_path(instance, filename):
    """
    Temporary upload path.
    The final filename will be fixed in save().
    """
    ext = filename.split('.')[-1].lower()
    return f"movies/temp/{uuid.uuid4()}.{ext}"
