import json
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages
from django.core.paginator import Paginator
from django.core.cache import cache

from .models import Song, Genre, Favorite


def index(request):
    """Main player view with search, genre filter, sidebar data."""
    songs_qs = Song.objects.select_related('genre', 'album').all()

    # Search filter
    search_query = request.GET.get('search', '').strip()
    if search_query:
        songs_qs = songs_qs.filter(
            models_title_artist_search(search_query)
        )

    # Genre filter
    genre_slug = request.GET.get('genre', '').strip()
    if genre_slug:
        songs_qs = songs_qs.filter(genre__slug=genre_slug)

    # Paginate — 1 song per page for the player
    paginator = Paginator(songs_qs, 1)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Build sidebar song list (all songs, lightweight)
    all_songs = Song.objects.select_related('genre').only(
        'id', 'title', 'artist', 'image', 'genre__name'
    )

    # Get user favorites
    favorite_ids = set()
    if request.user.is_authenticated:
        favorite_ids = set(
            Favorite.objects.filter(user=request.user)
            .values_list('song_id', flat=True)
        )

    songs_json = json.dumps([
        {
            'id': s.id,
            'title': s.title,
            'artist': s.artist,
            'image_url': s.image.url if s.image else '',
            'genre': s.genre.name if s.genre else '',
            'is_favorite': s.id in favorite_ids,
        }
        for s in all_songs
    ])

    # All genres for filter chips
    genres = cache.get('all_genres')
    if genres is None:
        genres = list(Genre.objects.values('name', 'slug', 'color'))
        cache.set('all_genres', genres, 300)  # Cache for 5 minutes

    context = {
        'page_obj': page_obj,
        'songs_json': songs_json,
        'genres': genres,
        'search_query': search_query,
        'active_genre': genre_slug,
        'favorite_ids': favorite_ids,
        'total_songs': paginator.count,
    }
    return render(request, 'index.html', context)


def models_title_artist_search(query):
    """Build a Q filter for title/artist search."""
    from django.db.models import Q
    return Q(title__icontains=query) | Q(artist__icontains=query)


def register_view(request):
    """User registration page."""
    if request.user.is_authenticated:
        return redirect('buzz:index')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Welcome, {user.username}! Your account has been created.')
            return redirect('buzz:index')
    else:
        form = UserCreationForm()

    return render(request, 'register.html', {'form': form})


def login_view(request):
    """User login page."""
    if request.user.is_authenticated:
        return redirect('buzz:index')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back, {user.username}!')
            next_url = request.GET.get('next', 'buzz:index')
            return redirect(next_url)
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})


def logout_view(request):
    """Log out the current user."""
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('buzz:index')