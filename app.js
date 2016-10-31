$(document).ready(function() {
    $('#js-gears').hide()
    //STATE OBJECT
    var state = {
        artistId: [],
        similarArtistId: [],
        similarArtistNames: [],
        similarArtistSongs: [],
        similarArtistImages: [],
        allImageUrls: [],
        topTrackNames: [],
        topTracksYouTube: [],
        numberOfResults: 12,
        resubmit: 0
    };

    //EVENT LISTENERS
    $(function() {
        $('#js-search-form').submit(function(e) {
            e.preventDefault();
            $('#js-gears').fadeIn(100)
            $('#js-results-container').hide()
                // $(":submit").attr("disabled", true);
            resetState();
            getArtistId($('#search-input').val());
            console.log(state)

        });
    });

    //FUNCTIONS THAT MODIFY STATE
    var resetState = function() {
            state.artistId = [];
            state.similarArtistId = [];
            state.similarArtistNames = [];
            state.similarArtistSongs = [];
            state.similarArtistImages = [];
            state.allImageUrls = [];
            state.topTrackNames = [];
            state.topTracksYouTube = [];
            state.resubmit = 0
        }
        //SPOTIFY API
    var getArtistId = function(q) {
        return $.get('https://api.spotify.com/v1/search', {
                q: q,
                type: "artist"
            })
            .then(function(result) {
                // console.log(result)
                state.artistId.push(result.artists.items[0].id);
                // console.log("State.artistId:",state.artistId.length)
                if (state.artistId.length === 1) {
                    getSimilarArtists(state.artistId[0]);
                    // console.log(state.artistId)
                }
            });
    };
    var getSimilarArtists = function(id) {
        return $.get('https://api.spotify.com/v1/artists/' + id + '/related-artists', {
            type: "artist",
        }).then(function(result) {
            // console.log (result.artists)
            // createDivs(state.numberOfResults)
            result.artists.forEach(function(artists) {
                state.similarArtistId.push(artists.id);
                // console.log("state.similarArtistId:",state.similarArtistId.length)
                if (state.similarArtistId.length == state.numberOfResults) {
                    // console.log ("Getting Artwork and Name!")
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
                    // console.log(result)
                    state.similarArtistNames.push(result.tracks[0].artists[0].name)
                    state.similarArtistImages.push(result.tracks[0].album.images[0].url)
                    state.topTrackNames.push((result.tracks[0].name).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""))
                        // console.log (state.topTrackNames)
                    if (state.similarArtistNames.length == state.numberOfResults) {
                        for (var i = 0; i < state.numberOfResults; i++) {
                            getYoutubeSearch(state.topTrackNames[i], state.similarArtistNames[i], "music video");
                        }
                    }
                });
        })
    };

    //YOUTUBE API
    function getYoutubeSearch(q, name, musicVideo) {
        // console.log ("FIRING")
        return $.get('https://www.googleapis.com/youtube/v3/search', {
            part: 'snippet',
            key: 'AIzaSyAs_Lal_n3-LakD3xnUmFqKRzhgJiiMifI',
            q: q + name,
            // order: "viewCount",
            type: 'video',
            // maxResults: 5,
            // category: '10'
        }).then(function(result) {
            // console.log(result)
            // for (var i = 0; i < 1; i++) {
            if (result.items.length === 0) {
                state.topTracksYouTube.push()
            } else {
                // console.log(result)
                state.topTracksYouTube.push(result.items[0].id.videoId)
            }
            // }
            // console.log (state.topTracksYouTube.length, state.numberOfResults)
            // if (state.topTracksYouTube.length == state.numberOfResults-1) {
            displaySimilarArtistNames(('.col-4'), state.similarArtistNames)
                // }
        })
    }
    //LYRICSWIKIA API

    //FUNCTIONS THAT RENDER STATE
    var displaySimilarArtistNames = function(element, names) {
        // console.log ("RENDERING STATE")
        $(element).html('');
        for (var i = 0, n = i + state.numberOfResults; i < state.numberOfResults; i++) {
            $(element).eq(n).remove()
            $(element).eq(i).html(`<div>${state.similarArtistNames[i]}<img class="artistImg" src="${state.similarArtistImages[i]}"></div>
                  </br>
                  <span>Listen to Top Track</span>
                  </br>
                  <div class="listen">
                  </div>`)
            if (state.topTracksYouTube[i]) {
                // console.log(i, state.numberOfResults - 1)
                $('.listen').eq(i).html(`<a href="https://www.youtube.com/watch?v=${state.topTracksYouTube[i]}">
                                                          <img class="icons" src="images/yt-icon.png" alt="Watch top track on YouTube">
                                                       </a>`)
            }

        }
        setTimeout(resubmitter, 1000)
    };

    var resubmitter = function() {
        // console.log (state)
        if (state.resubmit === 0) {
            console.log("IF")
            $('#js-search-form').submit();
            state.resubmit++
        } else if (state.resubmit === 1) {
            state.resubmit++
                console.log("ELSE")
            $('#js-gears').fadeOut(100)
            $('#js-results-container').show(500)
        }
    }

})
