import Widget from 'resource:///com/github/Aylur/ags/widget.js';
const { Box, CenterBox, Overlay } = Widget;

// Import modules
import Time from './time.js';
import Workspace from './workspace.js';
import Battery from './battery.js';

// Modules declaration
const leftModuleCallbacks = [Time];
const centerModuleCallbacks = [Workspace];
const rightModuleCallbacks = [Battery];

export default (monitor = 0) => Widget.Window({
    monitor,
    name: `bar${monitor}`,
    anchor: ['bottom', 'left', 'right'],
    exclusivity: 'exclusive',
    visible: true,
    child: Overlay({
        child: Box({
            className: 'bar-bg',
        }),
        overlays: [
            CenterBox({
                startWidget: Widget.Box({ children: leftModuleCallbacks.map(m => m(monitor)) }),
                centerWidget: Widget.Box({ children: centerModuleCallbacks.map(m => m(monitor)) }),
                endWidget: Widget.Box({ hpack: 'end', children: rightModuleCallbacks.map(m => m(monitor)) }),
            })
        ]
    })
});
