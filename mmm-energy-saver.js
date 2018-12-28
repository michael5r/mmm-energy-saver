/* global Module */

/* Magic Mirror
 * Module: mmm-energy-saver
 *
 * By Michael Schmidt
 * https://github.com/michael5r
 *
 * MIT Licensed.
 */

Module.register('mmm-energy-saver', {

    defaults: {
        timeoutInSeconds: 300,        // this is in seconds (not ms)
        triggerMonitor: true,         // whether the monitor should be turned off
        monitorOn: '00 30 7 * * *',   // on at 07:30 am
        monitorOff: '00 30 23 * * *', // off at 11:30 pm
        animationSpeed: 2 * 1000,
        version: '1.0.0'
    },

    start: function() {

        Log.info('Starting module: ' + this.name + ', version ' + this.config.version);

        this.sendSocketNotification('MMM_ENERGY_SAVER_CONFIG', this.config);

        this.sleepTimer = null;
        this.sleeping = false;
        this.deepSleep = false; // when the monitor is off

    },

    notificationReceived(notification, payload, sender) {

        var self = this;

        if (notification === 'DOM_OBJECTS_CREATED') {

            this.sendSocketNotification('MMM_ENERGY_SAVER_INIT', true);

        } else if (notification === 'USER_PRESENCE') {

            if ((payload === true) && (!this.deepSleep)) {
                if (this.sleeping) {
                    this.sendResume();
                } else {
                    clearTimeout(this.sleepTimer);
                    this.sleepTimer = setTimeout(function() {
                        self.sendSuspend();
                    }, self.config.timeoutInSeconds * 1000);
                }
            }

        }

    },

    socketNotificationReceived: function(notification, payload) {

        var self = this;

        if (notification === 'MMM_ENERGY_SAVER_MONITOR_OFF') {

            this.deepSleep = true;
            clearTimeout(this.sleepTimer);
            this.sendSuspend();

        } else if (notification === 'MMM_ENERGY_SAVER_MONITOR_ON') {

            this.deepSleep = false;
            this.sendResume();

            // restart regular timer
            clearTimeout(this.sleepTimer);
            this.sleepTimer = setTimeout(function() {
                self.sendSuspend();
            }, self.config.timeoutInSeconds * 1000);

        }

    },

    sendSuspend: function() {

        var self = this;

        if (!this.sleeping) {

            this.sleeping = true;

            // hide all modules
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.hide(self.config.animationSpeed);
            });

            // send notification
            console.log(self.name + ' has suspended all modules ...');
            this.sendNotification('MMM_ENERGY_SAVER', 'suspend');

        }

    },

    sendResume: function() {

        var self = this;

        if (this.sleeping) {

            this.sleeping = false;

            // show all modules
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.show(self.config.animationSpeed);
            });

            // send notification
            console.log(self.name + ' has resumed all modules ...');
            this.sendNotification('MMM_ENERGY_SAVER', 'resume');

        }

    }

});
