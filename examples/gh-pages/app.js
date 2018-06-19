localStorage.debug = 'gameboy:cart';

var gameboy = window.gameboy = new (window.Gameboy)();

// Render

var canvas = document.getElementById('frame');

var ctx = canvas.getContext('2d');
gameboy.gpu.on('frame', function (offcanvas) {
    ctx.drawImage(offcanvas, 0, 0);
});

// Buttons

function loadFile () {
    if (!this.files.length) return;

    var reader = new FileReader();
    reader.onloadend = function () {
        gameboy.loadCart(new Uint8Array(reader.result));
        gameboy.start();
    };
    reader.readAsArrayBuffer(this.files[0]);
}

function fullscreen () {
    (
        canvas.requestFullscreen ||
        canvas.mozRequestFullScreen ||
        canvas.webkitRequestFullscreen ||
        canvas.msRequestFullscreen
    )
    .call(canvas);
}

$('#input').change(loadFile);
$('#fullscreen').click(fullscreen);
$('#pause').click(function () { gameboy.pauseResume() });
$('#reset').click(function () { gameboy.reset() });
$('#rendering').click(function () { $('#frame').toggleClass('pixelated') });

// Joypad

$(document).keydown(function (e) { gameboy.joypad.keyDown(e.keyCode) });
$(document).keyup(function (e) { gameboy.joypad.keyUp(e.keyCode) });
