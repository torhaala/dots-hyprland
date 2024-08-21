const { Gdk } = imports.gi;
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
const { execAsync, exec } = Utils;

const SCALE_METHOD = "gdk"; // "gdk" or "division"

const display = Gdk.Display.get_default();
export let monitors = JSON.parse(exec('hyprctl monitors -j')).map((monitor, i) => {
    const gdkMonitor = display.get_monitor(i);
    monitor.realWidth = monitor.width;
    monitor.realHeight = monitor.height;
    if (SCALE_METHOD == "gdk") {
        monitor.width = gdkMonitor.get_geometry().width;
        monitor.height = gdkMonitor.get_geometry().height;
    }
    else { // == "division"
        monitor.width = Math.ceil(monitor.realWidth / monitor.scale);
        monitor.height = Math.ceil(monitor.realHeight / monitor.scale);
    }
    return monitor;
});

