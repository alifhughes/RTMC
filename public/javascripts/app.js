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

// Connect to socket
var socket = io.connect('http://localhost:3000');

// Init the master controls
var masterControls = new MasterControls(arrangement);

// Init window updater
var windowUpdater = new WindowUpdater(masterControls);

// Create new instance of sync
var sync = new Sync(windowUpdater, socket, arrangementId);

