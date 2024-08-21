import Widget from 'resource:///com/github/Aylur/ags/widget.js';
const { Box } = Widget;

import PopupWindow from '../common/popupwindow.js';

import Workspaces from './workspaces.js';

export default (monitor = 0) => PopupWindow({
    name: `overview${monitor}`,
    monitor,
    anchor: ['bottom'],
    layer: 'top',
    child: Box({
        homogeneous: true,
        className: 'padding-10',
        children: [Box({
            className: 'overview-bg padding-10 margin-10',
            children: [
                Workspaces(monitor),
            ]
        })]
    })
})
