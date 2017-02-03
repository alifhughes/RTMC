var plan = require('flightplan');

var appName = 'rtmc';
var username = 'alistair';
var startFile = 'bin/www';

// Make a temp directory with timestamp for this deployment
var tmpDir = appName + '-' + new Date().getTime();

// configuration
plan.target('production', [
  {
    host: '137.74.165.127',
    username: username,
    privateKey: '/Users/user/.ssh/id_rsa',
    agent: process.env.SSH_AUTH_SOCK
  }
]);

// run commands on localhost
plan.local(function(local) {
  // Run Gulp build
  local.log('Run build');
  local.exec('gulp build');

  // Copy local files
  local.log('Copy files to remote hosts');

  // List files to copy from git checkout
  var filesToCopy = local.exec('git ls-files', {silent: true});

  // rsync files to all the destination's hosts
  local.transfer(filesToCopy, '/tmp/' + tmpDir);

    local.debug('Copying files to remote hosts');
});

// run commands on remote hosts (destinations)
plan.remote(function(remote) {

  // Copy files over
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.rm('-rf /tmp/' + tmpDir);

  // Install dependencies
  remote.log('Install dependencies');
  remote.sudo('npm --production --prefix ~/' + tmpDir + ' install ~/' + tmpDir, {user: username});

  // Reload application
  remote.log('Reload application');
  remote.sudo('ln -snf ~/' + tmpDir + ' ~/'+appName, {user: username});
  remote.exec('forever stop ~/'+appName+'/'+startFile, {failsafe: true});
  remote.exec('forever start ~/'+appName+'/'+startFile);
});
