let play_pause = 'play';
let random = false;
let repeat = false;

let audioPlayer;
let current_track = 0;

window.onload = () => {
    init();
    time_loop();
};

function init() {

    // Initialize player
    audioPlayer = new Audio(tracks[current_track]);

    // Check if audio has finished
    audioPlayer.addEventListener('ended', () => {
        current_track++;
        audioPlayer.src = tracks[current_track];
        audioPlayer.play();
    });

    // Create the list of tracks
    tracks.forEach(element => {
        $(".list").append("<hr>");

        // Remove path and take just the name
        const name = element.split('\\').pop();

        $(".list").append(`<p>${name}</p>`);
    });

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

    // Random
    $("#random").bind('click', () => {
        random = !random;

        if (random) {
            $("#random").css('background-color', 'rgba(128, 128, 128, 0.308)');
        } else {
            $("#random").css('background-color', 'transparent');
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
        }
    });

    // Skip forward
    $("#step-forward").bind('click', () => {
        if (current_track < tracks.length) {
            current_track++;
            audioPlayer.src = tracks[current_track];
            audioPlayer.play();
        }
    });

    // Moving the slide-time changes song current position
    $("#slider-time").bind('change', () => {
        audioPlayer.currentTime = $("#slider-time").val();
    });

    // Check if mouse is pressed and released so the loop doesn't take over
    $("#slider-time").mousedown(function() {
        $(this).data('clicked', true);
    });

    $("#slider-time").mouseup(function() {
        $(this).data('clicked', false);
    });

    // Volume
    $("#volume-slider").bind('change', () => {
        audioPlayer.volume = $("#volume-slider").val() / 100;
    });
}

function toInt(number) {
    return Number.parseInt((number).toString());
}

function time_loop() {

    // Set song name
    const name = tracks[current_track].split('\\').pop();
    $('.song-name').text(name);

    // Get current time in the song
    const cur_time = toInt(audioPlayer.currentTime);
    let cur_minutes = toInt(cur_time / 60);
    let cur_seconds = toInt(cur_time % 60);

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