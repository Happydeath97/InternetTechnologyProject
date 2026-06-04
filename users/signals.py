from django.contrib.sessions.models import Session
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Ban


def force_logout_user(user_id):
    """
    Delete all active Django sessions belonging to the given user.

    This works with database-backed sessions and cached_db sessions.
    It will not work with purely cookie-based sessions because those sessions
    are stored client-side.
    """
    if not user_id:
        return

    user_id = str(user_id)

    active_sessions = Session.objects.filter(expire_date__gte=timezone.now())

    for session in active_sessions:
        try:
            session_data = session.get_decoded()
        except Exception:
            continue

        session_user_id = session_data.get("_auth_user_id")

        if session_user_id == user_id:
            session.delete()


@receiver(post_save, sender=Ban)
def logout_user_after_active_ban(sender, instance, created, **kwargs):
    """
    When a ban is created or updated and is currently active,
    immediately log out the banned user from all active sessions.
    """
    if not instance.user_id:
        return

    if not instance.is_active_now():
        return

    transaction.on_commit(lambda: force_logout_user(instance.user_id))