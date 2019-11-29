let play_pause = 'pause';
let random = false;
let repeat = false;

window.onload = () => {
    init();
};

function init() {
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
            play_pause = 'pause';
            $("#play-pause").addClass("fa fa-pause fa-lg nav-item");
        } else if (play_pause == 'pause') {
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
    });
}