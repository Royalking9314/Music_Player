from django.shortcuts import render
from .models import Song
from django.core.paginator import Paginator

# Create your views here.
def index(request):
    paginator = Paginator(Song.objects.all(), 1)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    context = {'page_obj': page_obj}
    return render(request, 'index.html', context)


def player_view(request):
    """
    Renders the live-lyrics player page.
    The template expects static files to be available under:
      static/music_player/js/lyrics_bg.js
      static/music_player/css/lyrics_bg.css
      static/music_player/media/example.mp3  (replace with your file)
    """
    return render(request, 'player.html', {})