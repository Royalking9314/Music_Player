from django.db import models

# Create your models here.

class Song(models.Model):
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    image = models.ImageField(upload_to='images/')
    lyrics = models.TextField(null=True, blank=True)
    duration = models.DurationField(max_length=20, default="00:15:00", null=True, blank=True)
    audio_file = models.FileField(upload_to='songs/', null=True, blank=True)
    audio_link = models.CharField(max_length=500, default="True", null=True, blank=True)
    paginate_by = 2

    def __str__(self):
        return self.title