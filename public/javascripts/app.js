var Sync = require('./helpers/sync');
var NXLoader = require('./helpers/nxloader');
var arrangement = require('./model/arrangement');
var MasterControls = require('./mastercontrols');
var WindowUpdater = require('./windowupdater');

// Load the nexus ui
nxloader = new NXLoader();
nxloader.load();

// Get the arrangement Id from the URL
var url = window.location.pathname;
var arrangementId = url.split('/')[3];

// Set the arrangement id
arrangement.setId(arrangementId);

// Check if running locally or on server
if ('localhost' === window.location.hostname) {
    // Connect to socket locally
    var socket = io.connect('http://localhost:3000');
} else {
    // Connect to socket remotely
    var socket = io.connect('http://137.74.165.127:3000');
}

// Get the user id from hidden input
var userId = document.getElementById('userId').value;

// Init the master controls
var masterControls = new MasterControls(arrangement);

// Init window updater
var windowUpdater = new WindowUpdater(masterControls);

// Create new instance of sync
var sync = new Sync(windowUpdater, socket, arrangementId, userId);

