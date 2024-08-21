import Quickshell
import Quickshell.Io
import Quickshell.Wayland
import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "../../lib"
import "../../"
import "../"

RowLayout {
    id: barRight
    anchors.right: barRect.right
    anchors.top: barRect.top
    anchors.bottom: barRect.bottom
    spacing: 5
    BarButton {
        RowLayout {
            spacing: 3
            Text {
                id: battIndicator
                color: Config.colors.fg0
                font {
                    family: Icons.fluent.fontFamily
                    pointSize: Config.font.fluentIconPointSize
                }
                text: `${Icons.fluent.battery.c0}`
            }
            Text {
                color: Config.colors.fg0
                font {
                    family: Icons.fluent.fontFamily
                    pointSize: Config.font.fluentIconPointSize
                }
                text: `${Icons.fluent.wifi.strong}`
            }
            Text {
                color: Config.colors.fg0
                font {
                    family: Icons.fluent.fontFamily
                    pointSize: Config.font.fluentIconPointSize
                }
                text: `${Icons.fluent.volume.l2}`
            }
        }
    }
    BarButton {
        ColumnLayout {
            spacing: -5
            Text {
                id: clock
                color: Config.colors.fg0
                font {
                    pointSize: Config.font.pointSize
                    family: Config.font.family
                }
                Layout.alignment: Qt.AlignRight
                Process {
                    command: ["date", "+%I:%M %p"]
                    running: true
                    stdout: SplitParser {
                        onRead: data => clock.text = data
                    }
                }
            }
            Text {
                id: clockdate
                color: Config.colors.fg0
                font {
                    pointSize: Config.font.pointSize
                    family: Config.font.family
                }
                Layout.alignment: Qt.AlignRight
                Process {
                    command: ["date", "+%d/%m/%Y"]
                    running: true
                    stdout: SplitParser {
                        onRead: data => clockdate.text = data
                    }
                }
            }
        }
    }
    Rectangle {
        width: 20
    }
}
