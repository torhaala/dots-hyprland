import GLib from 'gi://GLib';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
const { Box, EventBox, Label, Revealer, Scrollable } = Widget;

const TIME_FORMAT = "%H:%M";
const TIME_INTERVAL = 5000;
const DATE_FORMAT = "%A, %d/%m";
const DATE_INTERVAL = 5000;
const DATE_REVEAL_DURATION = 3000;

const TimeDisplay = () => Label({
    xalign: 0,
    className: 'bar-fg bar-time',
    label: GLib.DateTime.new_now_local().format(TIME_FORMAT),
    setup: (self) => self.poll(TIME_INTERVAL, label => {
        label.label = GLib.DateTime.new_now_local().format(TIME_FORMAT);
    }),
});

const DateDisplay = () => Label({
    xalign: 0,
    className: 'bar-fg bar-date',
    label: GLib.DateTime.new_now_local().format(DATE_FORMAT),
    setup: (self) => self.poll(DATE_INTERVAL, label => {
        label.label = GLib.DateTime.new_now_local().format(DATE_FORMAT);
    }),
});

export default () => {
    let hoverTimes = 0;
    const timeDisplay = TimeDisplay();
    const dateDisplay = DateDisplay();
    const revealDate = (reveal) => {
        timeDisplay.toggleClassName('bar-time-hover', reveal);
        dateDisplay.toggleClassName('bar-date-hover', reveal);
    }
    return EventBox({
        onHover: () => {
            revealDate(true);
            hoverTimes++;
            Utils.timeout(DATE_REVEAL_DURATION, () => {
                hoverTimes--;
                if (hoverTimes === 0) revealDate(false);
            });
        },
        onHoverLost: () => {
            revealDate(false);
            hoverTimes = 0;
        },
        child: Box({
            vpack: 'center',
            className: 'bar-visualheight',
            children: [Scrollable({
                hscroll: 'never',
                vscroll: 'automatic',
                child: Box({
                    vertical: true,
                    children: [
                        timeDisplay,
                        dateDisplay,
                    ]
                })
            })]
        })
    })
}