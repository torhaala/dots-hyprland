import Battery from 'resource:///com/github/Aylur/ags/service/battery.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { AnimatedCircProg } from '../common/circularprogress.js';
const { Box, EventBox, Label, Overlay } = Widget;

const BATTERY_LOW = 20;

const BarBatteryProgress = () => {
    const _updateProgress = (circprog) => { // Set circular progress value
        circprog.css = `font-size: ${Math.abs(Battery.percent)}px;`
        circprog.toggleClassName('bar-circprog-lowbatt', Battery.percent <= BATTERY_LOW);
        circprog.toggleClassName('bar-circprog-fullbatt', Battery.charged);
    }
    return AnimatedCircProg({
        // startAngle: -120,
        // endAngle: 120,
        className: 'bar-circprog',
        vpack: 'center', hpack: 'center',
        extraSetup: (self) => self
            .hook(Battery, _updateProgress)
        ,
    })
}

export default () => {
    return EventBox({
        vpack: 'center',
        child: Box({
            vpack: 'center',
            children: [
                Overlay({
                    child: Widget.Box({
                        vpack: 'center',
                        className: 'bar-batt',
                        homogeneous: true,
                        children: [
                            // MaterialIcon('battery_full', 'small'),
                            Label({
                                className: 'icon-material',
                                label: 'battery_full',
                            })
                        ],
                    }),
                    overlays: [
                        BarBatteryProgress(),
                    ]
                })
            ]
        })
    })
}
