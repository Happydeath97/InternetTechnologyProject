# Create your models here.
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


class Ban(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        REVOKED = 'revoked', 'Revoked'
        EXPIRED = 'expired', 'Expired'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_bans'
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='issued_bans'
    )
    reason = models.TextField()
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(blank=True, null=True)
    is_permanent = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        if self.user == self.admin:
            raise ValidationError('An admin cannot ban themselves.')

        if self.is_permanent and self.end_date is not None:
            raise ValidationError('Permanent bans must not have an end date.')

        if not self.is_permanent and self.end_date is not None:
            if self.end_date <= self.start_date:
                raise ValidationError('End date must be later than start date.')

    def is_active_now(self):
        if self.status != self.Status.ACTIVE:
            return False

        if self.is_permanent:
            return True

        if self.end_date is None:
            return True

        return self.end_date > timezone.now()

    def __str__(self):
        return f'Ban for {self.user.username} by {self.admin.username}'
