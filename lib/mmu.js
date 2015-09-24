function Mmu() {

    // Docs
    //
    // - http://meseec.ce.rit.edu/551-projects/spring2014/4-1.pdf

    this.memory = new Uint8Array(0xFFFF);

    for (var i = 0; i < this.memory.length; i++) {
        this.memory[i] = 0;
    }
}

Mmu.prototype.rb = function (addr) {
    return this.memory[addr];
};

Mmu.prototype.rw = function (addr) {
    return this.rb(addr) | this.rb(addr + 1) << 8;
};

module.exports = new Mmu;
