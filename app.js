$(document).ready(function() {
    $('.js-gears').hide()

    //STATE OBJECT
    var state = {
        artistId: [],
        similarArtistId: [],
        similarArtistNames: [],
        similarArtistImages: [],
        allImageUrls: [],
        topTrackNames: [],
        topTracksYouTube: [],
        previewUrl: [],
        numberOfResults: 16,
        resubmit: 0
    };

    //EVENT LISTENERS
    $('#js-search-form').submit(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.no-results').html('')
        $('.js-gears').removeClass('hidden').fadeIn(100)
        $('.col-4').hide()
        resetState();
        getArtistId($('#search-input').val());
    });

    //FUNCTIONS THAT MODIFY STATE
    var resetState = function() {
            state.artistId = [];
            state.similarArtistId = [];
            state.similarArtistNames = [];
            state.similarArtistImages = [];
            state.allImageUrls = [];
            state.topTrackNames = [];
            state.topTracksYouTube = [];
            state.previewUrl = [];
            // state.numberOfResults = 0;
            state.resubmit = 0;
        }
        //SPOTIFY API
    var getArtistId = function(q) {
        return $.get('https://api.spotify.com/v1/search', {
                q: q,
                type: "artist"
            })
            .then(function(result) {
                // console.log(result.artists.items.length)
                if (result.artists.items.length == 0) {
                    // console.log('if');
                    noResults('.no-results');
                } else if (result.artists.items.length >= 1) {
                    // console.log('else if')
                    state.artistId.push(result.artists.items[0].id);
                    getSimilarArtists(state.artistId[0]);

                };
            });
    };
    var getSimilarArtists = function(id) {
        // console.log('similarartists')
        return $.get('https://api.spotify.com/v1/artists/' + id + '/related-artists', {
            type: "artist",
            limit: '16'
        }).then(function(result) {
            // state.numberOfResults = result.artists.length
            result.artists.forEach(function(artists) {
                state.similarArtistId.push(artists.id);
                if (state.similarArtistId.length == state.numberOfResults) {
                    getArtworkAndName(state.similarArtistId);
                }
            });
        });
    };


    var getArtworkAndName = function(id) {
        id.forEach(function(result) {
            return $.get('https://api.spotify.com/v1/artists/' + result + '/top-tracks', {
                    country: 'US',
                    popularity: '100'
                })
                .done(function(result) {
                    // console.log ("GETTING ARTWORK AND NAME")
                    if (result.tracks[0] != null) {
                        state.similarArtistNames.push(result.tracks[0].artists[0].name)
                        console.log (state.similarArtistNames.length)
                        state.similarArtistImages.push(result.tracks[0].album.images[0].url)
                        state.topTrackNames.push((result.tracks[0].name).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""))
                        state.previewUrl.push(result.tracks[0].preview_url)
                        if (state.similarArtistNames.length == state.numberOfResults) {
                            for (var i = 0; i < state.numberOfResults; i++) {
                                getYoutubeSearch(state.topTrackNames[i], state.similarArtistNames[i], '-cover');
                            }
                        }
                    }
                    else if (result.tracks[0] == null){
                        noResults('.no-results');
                    }
                });
        })
    };

    //YOUTUBE API
    function getYoutubeSearch(q, name, musicVideo) {
        // console.log ("GETTING YT SEARCH")
        return $.get('https://www.googleapis.com/youtube/v3/search', {
            part: 'snippet',
            key: 'AIzaSyAs_Lal_n3-LakD3xnUmFqKRzhgJiiMifI',
            q: q + name,
            type: 'video',
        }).then(function(result) {
            if (result.items.length === 0) {
                state.topTracksYouTube.push('')
            } else {
                state.topTracksYouTube.push(result.items[0].id.videoId)
            }
            displaySimilarArtistNames(('.col-4'), state.similarArtistNames)
        })
    }
    //LYRICSWIKIA API

    //FUNCTIONS THAT RENDER STATE
    var displaySimilarArtistNames = function(element, names) {
        $(element).html('');
        for (var i = 0, n = i + state.numberOfResults; i < state.numberOfResults; i++) {
            $(element).eq(n).remove()
            $(element).eq(i).html(`
                <div class="listen" style="background-image:url(${state.similarArtistImages[i]})">
                    <p class="artist-name"><b>${state.similarArtistNames[i]}</b></br>
                    ${state.topTrackNames[i]}</p>
                    <audio id="sound1" src="${state.previewUrl[i]}" preload="none"></audio>
                    <button class="icons buttonbg" onclick="document.getElementById('sound1').play();">
                    <img class="icons" src="images/play-button.png" alt="Preview Track with Spotify">Spotify Sample
                    </button>
                    </div>`)
            if (state.topTracksYouTube[i] != '') {
                $(element).eq(i).html(`
                    <div class="listen" style="background-image:url(${state.similarArtistImages[i]})">
                        <p class="artist-name"><b>${state.similarArtistNames[i]}</b></br>
                        ${state.topTrackNames[i]}</p>
                        <a href="https://www.youtube.com/watch?v=${state.topTracksYouTube[i]}" target="_blank">
                            <img class="icons" src="images/play-button.png" alt="Watch top track on YouTube">
                        </a>
                    </div>`)
            }

        }
        setTimeout(resubmitter, 1000)
    };
    var noResults = function(element) {
        $('.js-gears').fadeOut(100).addClass('hidden');
        $('.no-results').html(`<h2>No results found. You either spelled it incorrectly or the artist is too obscure to get reliable results.</h2>`)
    }

    var resubmitter = function() {
        if (state.resubmit === 0) {
            $('#js-search-form').submit();
            state.resubmit++;
        } else if (state.resubmit === 1) {
            state.resubmit++;
            $('.js-gears').fadeOut(100).addClass('hidden');
            $('.col-4').removeClass('hidden').fadeIn(500);
        }
    }

})
