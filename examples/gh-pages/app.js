var gameboy = new (window.Gameboy)();

// localStorage.debug = '';

// Render

var canvas = document.getElementById('frame');
var ctx = canvas.getContext('2d');

gameboy.gpu.on('frame', function (offcanvas) {
    ctx.drawImage(offcanvas, 0, 0);
});

// Buttons

var inputAction = document.getElementById('input');
var pauseAction = document.getElementById('pause');
var resetAction = document.getElementById('reset');

function loadFile () {
    if (!this.files.length) return;

    var reader = new FileReader();
    reader.onloadend = function () {
        gameboy.loadCart(reader.result);
        gameboy.start();
    };
    reader.readAsArrayBuffer(this.files[0]);
}

inputAction.addEventListener('change', loadFile);
pauseAction.addEventListener('click', function () { gameboy.pauseResume(); });
resetAction.addEventListener('click', function () { gameboy.reset(); });

var renderingAction = document.getElementById('rendering');
var scaleAction = document.getElementById('scale');

renderingAction.addEventListener('click', function () {
    $(canvas).toggleClass('pixelated');
});

var sizes = ['160px', '320px', '640px'];

scaleAction.addEventListener('click', function () {
    var idx = sizes.indexOf(canvas.style.width || '320px');
    canvas.style.width = sizes[++idx % 3];
});

// Joypad

document.addEventListener('keydown', function (e) {
    gameboy.joypad.keyDown(e.keyCode);
});
document.addEventListener('keyup', function (e) {
    gameboy.joypad.keyUp(e.keyCode);
});
