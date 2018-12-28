var NodeHelper = require('node_helper');
var exec = require('child_process').exec;
var CronJob = require('cron').CronJob;

module.exports = NodeHelper.create({

    scheduledJobs: [],

    start: function() {

        console.log('Starting node_helper for module [' + this.name + ']');

        this.started = false;
        this.config = {};

    },

    initialize: function(config) {

        // set up monitor cron job
        if (this.config.triggerMonitor) {
            this.createCronJobs();
        }

    },

    turnOnMonitor: function() {

        // check to see if HDMI output is already on
        exec('/usr/bin/vcgencmd display_power').stdout.on('data', function(data) {
            if (data.indexOf('display_power=0') > -1) {
                // turn on HDMI output
                exec('/usr/bin/vcgencmd display_power 1', null);
            }
        });

        this.sendSocketNotification('MMM_ENERGY_SAVER_MONITOR_ON', true);

    },

    turnOffMonitor: function() {

        // turn off HDMI output
        exec('/usr/bin/vcgencmd display_power 0', null);

        this.sendSocketNotification('MMM_ENERGY_SAVER_MONITOR_OFF', true);

    },

    createCronJobs: function() {

        var self = this;

        // check for old cron jobs
        if (this.scheduledJobs.length > 0) {
            for (var i = 0; i < this.scheduledJobs.length; i++) {
                var job = this.scheduledJobs[i];
                this.stopCronJob(job);
            }
            this.scheduledJobs = [];
        }

        // create the monitor off cron job
        var offJob = new CronJob(self.config.monitorOff, function() {
            self.turnOffMonitor();
        });

        self.scheduledJobs.push(offJob);

        // create the monitor on cron job
        var onJob = new CronJob(self.config.monitorOn, function() {
            self.turnOnMonitor();
        });

        offJob.start();
        onJob.start();

        self.scheduledJobs.push(offJob);
        self.scheduledJobs.push(onJob);

    },

    stopCronJob: function(cronJob) {
        try {
            cronJob.stop();
        } catch(err) {
            console.log(this.name + ' was unable to stop the cron job.');
        }
    },

    socketNotificationReceived: function(notification, payload) {

        if ((notification === 'MMM_ENERGY_SAVER_CONFIG') && (!this.started)) {
            this.config = payload;
            this.started = true;
        } else if (notification === 'MMM_ENERGY_SAVER_INIT') {
            this.initialize();
        }

    }

});