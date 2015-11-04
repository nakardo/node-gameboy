//- http://www.codeslinger.co.uk/pages/projects/gameboy/timers.html

var TIMECNT = 0xFF05;
var TIMEMOD = 0xFF06;
var TIMCONT = 0xFF07;

function Timer(cpu, mmu) {

    this._cpu = cpu;
    this._mmu = mmu;
}

Timer.prototype.update = function () {

    this._mmu.writeByte(TIMECNT, this._cpu.t);
};

module.exports = Timer;
