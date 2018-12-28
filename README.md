# Module: mmm-energy-saver

The `mmm-energy-saver` module is a [MagicMirror](https://github.com/MichMich/MagicMirror) addon.
This module requires MagicMirror version `2.5` or later.

This module works in conjunction with [MMM-Pir-Sensor](https://github.com/paviro/MMM-PIR-Sensor) to automatically suspend & resume all your modules based on movement detection. Furthermore, this module allows you to specify times when all the modules are suspended and the screen is turned off as well.

**Please note that the movement detection will not work unless you have the MMM-Pir-Sensor module installed (and working).**

By design, this module has fairly limited functionality - which is nice because it makes it very easy to set up & use. If you, however, want a lot more control over the individual modules including setting specific timers based on days or showing alerts, I'd recommend checking out the [MMM-ModuleScheduler](https://github.com/ianperrin/MMM-ModuleScheduler) module instead.


## Table of Contents

- [Installing the module](#installing-the-module)
- [Using the module](#using-the-module)
- [General Configuration Options](#general-configuration-options)
- [Cron Expressions](#cron-expressions)
- [Developer Notes](#developer-notes)


## Installing the module

1) Run `git clone https://github.com/michael5r/mmm-energy-saver.git` from inside your `MagicMirror/modules` folder.
2) Run `cd mmm-energy-saver` in the same terminal window, then `npm install` to install the required Node modules.


## Using the module
To use this module, simply add it to the `modules` array in the MagicMirror `config/config.js` file:

```js
{
    module: "mmm-energy-saver",
    config: {
        // ... whatever configuration options you want to use
    }
},
```

Seeing that nothing is displayed on screen, there's no need to add a `position` property.


## General Configuration Options

Option             | Type      | Default          | Description
-------------------|-----------|------------------|-------------------------------------------------------
`timeoutInSeconds` | `int`     | `300`            | When motion is triggered, how long to wait<br/>before going to sleep. Default is 5 minutes.
`triggerMonitor`   | `boolean` | `true`           | Whether the monitor should be turned on and off.
`monitorOn`        | `string`  | `00 30 7 * * *`  | When to turn the monitor on. Default is 7:30 am.
`monitorOff`       | `string`  | `00 30 23 * * *` | When to turn the monitor off. Default is 11:30 pm.


## Cron Expressions

Both the `monitorOn` and `monitorOff` settings take valid `cron` expressions as their arguments. If you're confused as to the syntax to use,
check out the [Node-Cron documentation](https://github.com/kelektiv/node-cron#available-cron-patterns).


## Developer Notes

There are two ways of using this module's functionality inside other modules:

1) This module broadcasts a `MMM_ENERGY_SAVER` notification with the payload being either `suspend` or `resume` - you can listen for this notification in the `notificationReceived` method inside your own module and have your module update accordingly.

2) Seeing that this module uses the standard MagicMirror `module.hide` and `module.show` functions to hide/show modules which, in turn, automatically trigger the `suspend` & `resume` methods, it's fairly trivial to extend these directly in your module - like this:

```js
suspend: function() {
    // this method is triggered when a module is hidden using this.hide()
    // do something inside this module
},

resume: function() {
    // this method is triggered when a module is shown using this.show()
    // do something inside this module
},
```

I personally prefer method `2` - it's very clean and allows you to easily do stuff like temporarily pausing data updating when a module is suspended (aka hidden on the screen).

For more info, check out the MagicMirror [Modules](https://github.com/MichMich/MagicMirror/tree/master/modules#suspend) documentation.

For an example of how method `2` works, check out my [mmm-nest-status](https://github.com/michael5r/mmm-nest-status) module.