// TODO
// - Make client destroy/create not destroy and recreate the whole thing
// - Active ws hook optimization: only update when moving to next group
//
const { Gdk, Gtk } = imports.gi;
const { Gravity } = imports.gi.Gdk;
import App from 'resource:///com/github/Aylur/ags/app.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
const { Box } = Widget;
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
const { execAsync, exec } = Utils;

import { monitors } from '../../data/hyprland.js';

const ANIMATION_DURATION = 300;

const OVERVIEW_NUM_OF_COLS = 5;
const OVERVIEW_NUM_OF_ROWS = 2;
const OVERVIEW_SCALE = 0.18;
const OVERVIEW_WS_NUM_SCALE = 0.09;
const OVERVIEW_WS_NUM_MARGIN_SCALE = 0.07;

const NUM_OF_WORKSPACES_SHOWN = OVERVIEW_NUM_OF_COLS * OVERVIEW_NUM_OF_ROWS;
const TARGET = [Gtk.TargetEntry.new('text/plain', Gtk.TargetFlags.SAME_APP, 0)];

const arr = (s, n) => {
    const array = [];
    for (let i = 0; i < n; i++)
        array.push(s + i);

    return array;
};

const Workspace = (i, monitor) => {
    return Box({
        className: 'overview-workspace',
        css: `
            min-width: ${monitors[monitor].width * OVERVIEW_SCALE}px;
            min-height: ${monitors[monitor].height * OVERVIEW_SCALE}px;
        `,
    })
}

export default (monitor = 0) => {
    const clientMap = new Map();
    const ContextMenuWorkspaceArray = ({ label, actionFunc, thisWorkspace }) => Widget.MenuItem({
        label: `${label}`,
        setup: (menuItem) => {
            let submenu = new Gtk.Menu();
            submenu.className = 'menu';

            const offset = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN) * NUM_OF_WORKSPACES_SHOWN;
            const startWorkspace = offset + 1;
            const endWorkspace = startWorkspace + NUM_OF_WORKSPACES_SHOWN - 1;
            for (let i = startWorkspace; i <= endWorkspace; i++) {
                let button = new Gtk.MenuItem({
                    label: `Workspace ${i}`
                });
                button.connect("activate", () => {
                    // execAsync([`${onClickBinary}`, `${thisWorkspace}`, `${i}`]).catch(print);
                    actionFunc(thisWorkspace, i);
                    overviewTick.setValue(!overviewTick.value);
                });
                submenu.append(button);
            }
            menuItem.set_reserve_indicator(true);
            menuItem.set_submenu(submenu);
        }
    })

    const Window = ({ address, at: [x, y], size: [w, h], workspace: { id, name }, class: c, initialClass, monitor, title, xwayland }, screenCoords) => {
        const revealInfoCondition = (Math.min(w, h) * OVERVIEW_SCALE > 70);
        if (w <= 0 || h <= 0 || (c === '' && title === '')) return null;
        // Non-primary monitors
        if (screenCoords.x != 0) x -= screenCoords.x;
        if (screenCoords.y != 0) y -= screenCoords.y;
        // Other offscreen adjustments
        if (x + w <= 0) x += (Math.floor(x / monitors[monitor].width) * monitors[monitor].width);
        else if (x < 0) { w = x + w; x = 0; }
        if (y + h <= 0) x += (Math.floor(y / monitors[monitor].height) * monitors[monitor].height);
        else if (y < 0) { h = y + h; y = 0; }
        // Truncate if offscreen
        if (x + w > monitors[monitor].width) w = monitors[monitor].width - x;
        if (y + h > monitors[monitor].height) h = monitors[monitor].height - y;

        if(c.length == 0) c = initialClass;
        const iconName = substitute(c);
        const appIcon = iconExists(iconName) ? Widget.Icon({
            icon: iconName,
            size: Math.min(w, h) * OVERVIEW_SCALE / 2.5,
        }) : MaterialIcon('terminal', 'gigantic', {
            css: `font-size: ${Math.min(w, h) * OVERVIEW_SCALE / 2.5}px`,
        });
        return Widget.Button({
            attribute: {
                address, x, y, w, h, ws: id,
                updateIconSize: (self) => {
                    appIcon.size = Math.min(self.attribute.w, self.attribute.h) * OVERVIEW_SCALE / 2.5;
                },
            },
            className: 'overview-tasks-window',
            hpack: 'start',
            vpack: 'start',
            css: `
                margin-left: ${Math.round(x * OVERVIEW_SCALE)}px;
                margin-top: ${Math.round(y * OVERVIEW_SCALE)}px;
                margin-right: -${Math.round((x + w) * OVERVIEW_SCALE)}px;
                margin-bottom: -${Math.round((y + h) * OVERVIEW_SCALE)}px;
            `,
            onClicked: (self) => {
                Hyprland.messageAsync(`dispatch focuswindow address:${address}`);
                App.closeWindow('overview');
            },
            onMiddleClickRelease: () => Hyprland.messageAsync(`dispatch closewindow address:${address}`),
            onSecondaryClick: (button) => {
                button.toggleClassName('overview-tasks-window-selected', true);
                const menu = Widget.Menu({
                    className: 'menu',
                    children: [
                        Widget.MenuItem({
                            child: Widget.Label({
                                xalign: 0,
                                label: "Close (Middle-click)",
                            }),
                            onActivate: () => Hyprland.messageAsync(`dispatch closewindow address:${address}`),
                        }),
                        ContextMenuWorkspaceArray({
                            label: "Dump windows to workspace",
                            actionFunc: dumpToWorkspace,
                            thisWorkspace: Number(id)
                        }),
                        ContextMenuWorkspaceArray({
                            label: "Swap windows with workspace",
                            actionFunc: swapWorkspace,
                            thisWorkspace: Number(id)
                        }),
                    ],
                });
                menu.connect("deactivate", () => {
                    button.toggleClassName('overview-tasks-window-selected', false);
                })
                menu.connect("selection-done", () => {
                    button.toggleClassName('overview-tasks-window-selected', false);
                })
                menu.popup_at_widget(button.get_parent(), Gravity.SOUTH, Gravity.NORTH, null); // Show menu below the button
                button.connect("destroy", () => menu.destroy());
            },
            child: Widget.Box({
                homogeneous: true,
                child: Widget.Box({
                    vertical: true,
                    vpack: 'center',
                    children: [
                        appIcon,
                        // TODO: Add xwayland tag instead of just having italics
                        Widget.Revealer({
                            transition: 'slide_right',
                            revealChild: revealInfoCondition,
                            child: Widget.Revealer({
                                transition: 'slide_down',
                                revealChild: revealInfoCondition,
                                child: Widget.Label({
                                    maxWidthChars: 1, // Doesn't matter what number
                                    truncate: 'end',
                                    className: `margin-top-5 ${xwayland ? 'txt txt-italic' : 'txt'}`,
                                    css: `
                                font-size: ${Math.min(monitors[monitor].width, monitors[monitor].height) * OVERVIEW_SCALE / 14.6}px;
                                margin: 0px ${Math.min(monitors[monitor].width, monitors[monitor].height) * OVERVIEW_SCALE / 10}px;
                            `,
                                    // If the title is too short, include the class
                                    label: (title.length <= 1 ? `${c}: ${title}` : title),
                                })
                            })
                        })
                    ]
                })
            }),
            tooltipText: `${c}: ${title}`,
            setup: (button) => {
                setupCursorHoverGrab(button);

                button.drag_source_set(Gdk.ModifierType.BUTTON1_MASK, TARGET, Gdk.DragAction.MOVE);
                button.drag_source_set_icon_name(substitute(c));

                button.connect('drag-begin', (button) => {  // On drag start, add the dragging class
                    button.toggleClassName('overview-tasks-window-dragging', true);
                });
                button.connect('drag-data-get', (_w, _c, data) => { // On drag finish, give address
                    data.set_text(address, address.length);
                    button.toggleClassName('overview-tasks-window-dragging', false);
                });
            },
        });
    }

    const Workspace = (index) => {
        // const fixed = Widget.Fixed({
        //     attribute: {
        //         put: (widget, x, y) => {
        //             fixed.put(widget, x, y);
        //         },
        //         move: (widget, x, y) => {
        //             fixed.move(widget, x, y);
        //         },
        //     }
        // });
        const fixed = Widget.Box({
            attribute: {
                put: (widget, x, y) => {
                    if (!widget.attribute) return;
                    // Note: x and y are already multiplied by OVERVIEW_SCALE
                    const newCss = `
                        margin-left: ${Math.round(x)}px;
                        margin-top: ${Math.round(y)}px;
                        margin-right: -${Math.round(x + (widget.attribute.w * OVERVIEW_SCALE))}px;
                        margin-bottom: -${Math.round(y + (widget.attribute.h * OVERVIEW_SCALE))}px;
                    `;
                    widget.css = newCss;
                    fixed.pack_start(widget, false, false, 0);
                },
                move: (widget, x, y) => {
                    if (!widget) return;
                    if (!widget.attribute) return;
                    // Note: x and y are already multiplied by OVERVIEW_SCALE
                    const newCss = `
                        margin-left: ${Math.round(x)}px;
                        margin-top: ${Math.round(y)}px;
                        margin-right: -${Math.round(x + (widget.attribute.w * OVERVIEW_SCALE))}px;
                        margin-bottom: -${Math.round(y + (widget.attribute.h * OVERVIEW_SCALE))}px;
                    `;
                    widget.css = newCss;
                },
            }
        })
        const WorkspaceNumber = ({ index, ...rest }) => Widget.Label({
            className: 'overview-tasks-workspace-number',
            label: `${index}`,
            css: `
                margin: ${Math.min(monitors[overviewMonitor].width, monitors[overviewMonitor].height) * OVERVIEW_SCALE * OVERVIEW_WS_NUM_MARGIN_SCALE}px;
                font-size: ${monitors[overviewMonitor].height * OVERVIEW_SCALE * OVERVIEW_WS_NUM_SCALE}px;
            `,
            setup: (self) => self.hook(Hyprland.active.workspace, (self) => {
                // Update when going to new ws group
                const currentGroup = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN);
                self.label = `${currentGroup * NUM_OF_WORKSPACES_SHOWN + index}`;
            }),
            ...rest,
        })
        const widget = Widget.Box({
            className: 'overview-tasks-workspace',
            vpack: 'center',
            css: `
                min-width: ${monitors[overviewMonitor].width * OVERVIEW_SCALE}px;
                min-height: ${monitors[overviewMonitor].height * OVERVIEW_SCALE}px;
            `,
            children: [Widget.EventBox({
                hexpand: true,
                onPrimaryClick: () => {
                    Hyprland.messageAsync(`dispatch workspace ${index}`);
                    App.closeWindow('overview');
                },
                setup: (eventbox) => {
                    eventbox.drag_dest_set(Gtk.DestDefaults.ALL, TARGET, Gdk.DragAction.COPY);
                    eventbox.connect('drag-data-received', (_w, _c, _x, _y, data) => {
                        const offset = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN) * NUM_OF_WORKSPACES_SHOWN;
                        Hyprland.messageAsync(`dispatch movetoworkspacesilent ${index + offset},address:${data.get_text()}`)
                        overviewTick.setValue(!overviewTick.value);
                    });
                },
                child: Widget.Overlay({
                    child: Widget.Box({}),
                    overlays: [
                        WorkspaceNumber({ index: index, hpack: 'start', vpack: 'start' }),
                        fixed
                    ]
                }),
            })],
        });
        const offset = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN) * NUM_OF_WORKSPACES_SHOWN;
        fixed.attribute.put(WorkspaceNumber(offset + index), 0, 0);
        widget.clear = () => {
            const offset = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN) * NUM_OF_WORKSPACES_SHOWN;
            clientMap.forEach((client, address) => {
                if (!client) return;
                if ((client.attribute.ws <= offset || client.attribute.ws > offset + NUM_OF_WORKSPACES_SHOWN) ||
                    (client.attribute.ws == offset + index)) {
                    client.destroy();
                    client = null;
                    clientMap.delete(address);
                }
            });
        }
        widget.set = (clientJson, screenCoords) => {
            let c = clientMap.get(clientJson.address);
            if (c) {
                if (c.attribute?.ws !== clientJson.workspace.id) {
                    c.destroy();
                    c = null;
                    clientMap.delete(clientJson.address);
                }
                else if (c) {
                    c.attribute.w = clientJson.size[0];
                    c.attribute.h = clientJson.size[1];
                    c.attribute.updateIconSize(c);
                    fixed.attribute.move(c,
                        Math.max(0, clientJson.at[0] * OVERVIEW_SCALE),
                        Math.max(0, clientJson.at[1] * OVERVIEW_SCALE)
                    );
                    return;
                }
            }
            const newWindow = Window(clientJson, screenCoords);
            if (newWindow === null) return;
            // clientMap.set(clientJson.address, newWindow);
            fixed.attribute.put(newWindow,
                Math.max(0, newWindow.attribute.x * OVERVIEW_SCALE),
                Math.max(0, newWindow.attribute.y * OVERVIEW_SCALE)
            );
            clientMap.set(clientJson.address, newWindow);
        };
        widget.unset = (clientAddress) => {
            const offset = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN) * NUM_OF_WORKSPACES_SHOWN;
            let c = clientMap.get(clientAddress);
            if (!c) return;
            c.destroy();
            c = null;
            clientMap.delete(clientAddress);
        };
        widget.show = () => {
            fixed.show_all();
        }
        return widget;
    };

    const arr = (s, n) => {
        const array = [];
        for (let i = 0; i < n; i++)
            array.push(s + i);

        return array;
    };

    const OverviewRow = ({ startWorkspace, workspaces, windowName = 'overview' }) => Widget.Box({
        children: arr(startWorkspace, workspaces).map(Workspace),
        attribute: {
            workspaceGroup: Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN),
            monitorMap: [],
            getMonitorMap: (box) => {
                execAsync('hyprctl -j monitors').then(monitors => {
                    box.attribute.monitorMap = JSON.parse(monitors).reduce((acc, item) => {
                        acc[item.id] = { x: item.x, y: item.y };
                        return acc;
                    }, {});
                });
            },
            update: (box) => {
                const offset = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN) * NUM_OF_WORKSPACES_SHOWN;
                Hyprland.messageAsync('j/clients').then(clients => {
                    const allClients = JSON.parse(clients);
                    const kids = box.get_children();
                    kids.forEach(kid => kid.clear());
                    for (let i = 0; i < allClients.length; i++) {
                        const client = allClients[i];
                        const childID = client.workspace.id - (offset + startWorkspace);
                        if (offset + startWorkspace <= client.workspace.id &&
                            client.workspace.id <= offset + startWorkspace + workspaces) {
                            const screenCoords = box.attribute.monitorMap[client.monitor];
                            if (kids[childID]) {
                                kids[childID].set(client, screenCoords);
                            }
                            continue;
                        }
                    }
                    kids.forEach(kid => kid.show());
                }).catch(print);
            },
            updateWorkspace: (box, id) => {
                const offset = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN) * NUM_OF_WORKSPACES_SHOWN;
                if (!( // Not in range, ignore
                    offset + startWorkspace <= id &&
                    id <= offset + startWorkspace + workspaces
                )) return;
                // if (!App.getWindow(windowName)?.visible) return;
                Hyprland.messageAsync('j/clients').then(clients => {
                    const allClients = JSON.parse(clients);
                    const kids = box.get_children();
                    for (let i = 0; i < allClients.length; i++) {
                        const client = allClients[i];
                        if (client.workspace.id != id) continue;
                        const screenCoords = box.attribute.monitorMap[client.monitor];
                        kids[id - (offset + startWorkspace)]?.set(client, screenCoords);
                    }
                    kids[id - (offset + startWorkspace)]?.show();
                }).catch(print);
            },
        },
        setup: (box) => {
            box.attribute.getMonitorMap(box);
            box
                .hook(overviewTick, (box) => box.attribute.update(box))
                .hook(Hyprland, (box, clientAddress) => {
                    const offset = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN) * NUM_OF_WORKSPACES_SHOWN;
                    const kids = box.get_children();
                    const client = Hyprland.getClient(clientAddress);
                    if (!client) return;
                    const id = client.workspace.id;

                    box.attribute.updateWorkspace(box, id);
                    kids[id - (offset + startWorkspace)]?.unset(clientAddress);
                }, 'client-removed')
                .hook(Hyprland, (box, clientAddress) => {
                    const client = Hyprland.getClient(clientAddress);
                    if (!client) return;
                    box.attribute.updateWorkspace(box, client.workspace.id);
                }, 'client-added')
                .hook(Hyprland.active.workspace, (box) => {
                    // Full update when going to new ws group
                    const previousGroup = box.attribute.workspaceGroup;
                    const currentGroup = Math.floor((Hyprland.active.workspace.id - 1) / NUM_OF_WORKSPACES_SHOWN);
                    if (currentGroup !== previousGroup) {
                        if (!App.getWindow(windowName) || !App.getWindow(windowName).visible) return;
                        box.attribute.update(box);
                        box.attribute.workspaceGroup = currentGroup;
                    }
                })
                .hook(App, (box, name, visible) => { // Update on open
                    if (name == 'overview' && visible) box.attribute.update(box);
                })
        },
    });
    return Box({
        vertical: true,
        className: 'spacing-v-5',
        children: arr(0, OVERVIEW_NUM_OF_ROWS).map((row) => OverviewRow({
            startWorkspace: 1 + row * OVERVIEW_NUM_OF_ROWS,
            workspaces: OVERVIEW_NUM_OF_COLS,
        }))
    })
}