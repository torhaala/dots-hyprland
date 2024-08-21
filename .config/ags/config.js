"use strict";
// AGS libs
import Gdk from 'gi://Gdk';
import App from 'resource:///com/github/Aylur/ags/app.js'
import { forMonitors } from './helpers/monitor.js';
// Helpers
import { handleStyles, COMPILED_STYLE_DIR } from './helpers/styles.js';
// Widgets
import Bar from './widgets/bar/main.js';
import Overview from './widgets/overview/main.js';

// Start stuff
handleStyles();

const Windows = () => [
    forMonitors(Bar),
    forMonitors(Overview)
];

const closeWindowDelays = {}; // For animations

App.config({
    css: `${COMPILED_STYLE_DIR}/style.css`,
    stackTraceOnError: true,
    closeWindowDelay: closeWindowDelays,
    windows: Windows().flat(1),
});

