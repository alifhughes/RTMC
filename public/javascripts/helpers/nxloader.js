var nxloader = function () {
};

nxloader.prototype.load = function () {

    nx.onload = function () {

        // Colours
        nx.colorize("accent", "#ffbb4c");
        nx.colorize("fill", "#1D2632");

    }
};

module.exports = nxloader;
