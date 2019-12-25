let play_pause = 'pause';
let random = false;
let repeat = false;

let audioPlayer;
let current_track = 0;

window.onload = () => {
    init();
    time_loop();
};

function create_tracks_list(alphebeticalSort = false) {

    // Accept only .ogg and .mp3 formats
    for (let i = 0; i < tracks.length; i++) {
        const name = tracks[i].split('\\').pop();

        // If a element doesn't contain .ogg .mp3 file formats remove it
        if (!name.includes('.mp3') && !name.includes('.ogg')) {
            tracks.splice(i, 1);
            i--;
        }
    }

    console.log("Found " + tracks.length + " track(s)!");

    // Sort by alphebetical order
    if (alphebeticalSort) {
        tracks.sort((a, b) => {
            let element1 = a.split('\\').join('/');
            let element2 = b.split('\\').join('/');

            element1 = element1.split('/').pop();
            element2 = element2.split('/').pop();

            element1 = element1.toLowerCase();
            element2 = element2.toLowerCase();
            
            // if (a < b) return -1 or (if (b < a) return 1 or 0), na kraju returna -1, 1, ili 0
            return element1 < element2 ? -1 : element2 < element1 ? 1 : 0;
        });
    }

    // Create the list of tracks
    let i = 0;
    tracks.forEach(element => {
        $(".list").append("<hr>");

        // Replace all occurences of \ with / for linux compatibility
        element = element.split('\\').join('/');

        // Remove path and take just the name
        const name = element.split('/').pop();

        $(".list").append(`<p id="${i}" class="list-p">${name}</p>`);

        // Choose song with click on the list
        // Add event on every <p> element in the list
        $(".list").on('click', 'p', function () {
            current_track = $(this).attr('id');
            audioPlayer.src = tracks[current_track];
            const playPromise = audioPlayer.play();

            if (playPromise !== undefined) {
                playPromise.then(_ => {

                }).catch(error => {
                    //console.log(error);
                });
            }
        });

        i++;
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function init() {

    // Initialize player
    audioPlayer = new Audio(tracks[current_track]);
    audioPlayer.play();

    // Check if audio has finished
    audioPlayer.addEventListener('ended', () => {

        current_track++;

        // If the end of the list has been hit reset to first position
        if (current_track >= tracks.length) {
            current_track = 0;
        }
        console.log(current_track);
        audioPlayer.src = tracks[current_track];
        audioPlayer.play();

        // Set the scroll to the next song
        $(".list").data('clicked', false);
    });

    // Create the list of tracks
    create_tracks_list(true);

    // Initialy hide list-down and the list
    $("#list-down").hide();
    $('.list').hide();

    // Change list-button on click
    // Down-button
    $("#list-down").bind('click', () => {
        $("#list-down").hide();
        $("#list-up").show();
        $('.list').hide();

        // Remove margin from main
        $(".main").css('margin-bottom', '0');
    });

    // Up-button
    $("#list-up").bind('click', () => {
        $("#list-up").hide();
        $("#list-down").show();
        $('.list').show();

        // Margin up main
        $(".main").css('margin-bottom', '50vh');
    });

    // Play-Pause
    $("#play-pause").bind('click', () => {
        $("#play-pause").removeClass();

        if (play_pause == 'play') {
            audioPlayer.play();
            play_pause = 'pause';
            $("#play-pause").addClass("fa fa-pause fa-lg nav-item");
        } else if (play_pause == 'pause') {
            audioPlayer.pause();
            play_pause = 'play';
            $("#play-pause").addClass("fa fa-play fa-lg nav-item");
        }
    });

    // Space keypress for pause and play
    $(window).keypress((e) => {
        if (e.key === ' ' || e.key === 'Spacebar') {
            $("#play-pause").removeClass();

            if (play_pause == 'play') {
                audioPlayer.play();
                play_pause = 'pause';
                $("#play-pause").addClass("fa fa-pause fa-lg nav-item");
            } else if (play_pause == 'pause') {
                audioPlayer.pause();
                play_pause = 'play';
                $("#play-pause").addClass("fa fa-play fa-lg nav-item");
            }
        }
    });

    // Random
    $("#random").bind('click', () => {
        random = !random;

        if (random) {
            $("#random").css('background-color', 'rgba(128, 128, 128, 0.308)');

            // Remove all child nodes
            $(".list").empty();
            // Shuffle the tracks array
            shuffleArray(tracks);
            // Create the new track list
            create_tracks_list();
            // Play the new current song
            audioPlayer.src = tracks[current_track];
            audioPlayer.play();

        } else {
            $("#random").css('background-color', 'transparent');

            // Remove all child nodes
            $(".list").empty();
            // Create a new tracklist that is sorted like default
            create_tracks_list(true);
            // Play the new current song
            audioPlayer.src = tracks[current_track];
            audioPlayer.play();
        }
    });

    // Repeat
    $("#repeat").bind('click', () => {
        repeat = !repeat;

        if (repeat) {
            $("#repeat").css('background-color', 'rgba(128, 128, 128, 0.308)');
        } else {
            $("#repeat").css('background-color', 'transparent');
        }

        audioPlayer.loop = repeat;
    });

    // Skip back
    $("#step-backward").bind('click', () => {
        if (current_track > 0) {
            current_track--;
            audioPlayer.src = tracks[current_track];
            audioPlayer.play();

            // Set the scroll to the next song
            $(".list").data('clicked', false);
        }
    });

    // Skip forward
    $("#step-forward").bind('click', () => {
        if (current_track < tracks.length) {
            current_track++;
            audioPlayer.src = tracks[current_track];
            audioPlayer.play();

            // Set the scroll to the next song
            $(".list").data('clicked', false);
        }
    });

    // Moving the slide-time changes song current position
    $("#slider-time").bind('change', () => {
        audioPlayer.currentTime = $("#slider-time").val();
    });

    // Check if mouse is pressed and released so the loop doesn't take over
    $("#slider-time").mousedown(function () {
        $(this).data('clicked', true);
    });

    $("#slider-time").mouseup(function () {
        $(this).data('clicked', false);
    });

    // Volume
    $("#volume-slider").bind('change', () => {
        audioPlayer.volume = $("#volume-slider").val() / 100;
    });

    // Check if the user is scrolling because loop takes over otherwise
    $(".list").scroll(function () {
        $(this).data('clicked', true);
    });
}

function toInt(number) {
    return Number.parseInt((number).toString());
}

function time_loop() {

    // Set song name
    const track = tracks[current_track].split('\\').join('/');
    const name = track.split('/').pop();
    $('.song-name').text(name);

    // Get current time in the song
    const cur_time = toInt(audioPlayer.currentTime);
    let cur_minutes = toInt(cur_time / 60);
    let cur_seconds = toInt(cur_time % 60);

    // Highligh current song in blue
    const array = $(".list").children().map((index) => {
        // Get every second element because of hr between p elements
        if (index % 2 != 0) {
            return index;
        }
    });

    // Colour only the current playing one to blue and the rest to white
    $(".list").children().css("color", "white");
    $(".list").children().eq(array[current_track]).css("color", "blue");

    // Scroll to next song only if the user isn't scrolling
    if (!$(".list").data('clicked')) {
        $(".list").scrollTop(array[current_track] * $(".list").children().eq(1).innerHeight() * 1.37);
    }

    // Move slider-time
    // Check if the user is changing the position
    // If he is stop updating
    if (!$("#slider-time").data('clicked')) {
        $("#slider-time").attr('max', toInt(audioPlayer.duration));
        $("#slider-time").val(cur_time);
    }

    // Add the extra 0 infront if lower then 10
    if (cur_minutes < 10) {
        cur_minutes = '0' + cur_minutes.toString();
    }
    if (cur_seconds < 10) {
        cur_seconds = '0' + cur_seconds.toString();
    }

    $("#current-time").text(`${cur_minutes}:${cur_seconds}`);

    // Calculate total time
    const total_time = audioPlayer.duration;
    let end_minutes = toInt(total_time / 60);
    let end_seconds = toInt(total_time % 60);

    // Add the extra 0 infront if lower then 10
    if (end_minutes < 10) {
        end_minutes = '0' + end_minutes.toString();
    }
    if (end_seconds < 10) {
        end_seconds = '0' + end_seconds.toString();
    }

    $("#end-time").text(`${end_minutes}:${end_seconds}`);

    window.requestAnimationFrame(time_loop);
}