import Quickshell
import Quickshell.Io
import Quickshell.Wayland
import QtQuick
import QtQuick.Layouts
import ".."
import "./bar"


PanelWindow {
  id: winbar
  WlrLayershell.namespace: "shell:winbar"
  anchors {
    bottom: true
    left: true
    right: true
  }

  height: 47
  color: Config.colors.transparent

  Rectangle {
    id: barRect
    anchors.fill: parent
    color: Config.colors.bg0

    BarCenter {}
    BarRight {}
  }
  StartMenu {
    id: startMenu
    parent: winbar
  }
}
