pragma Singleton
import QtQuick
import Quickshell

Singleton {
	readonly property bool debug: true
	readonly property QtObject colors: QtObject {
		readonly property string transparent: "#00000000"
		readonly property string bg0: "#8F292929"
		readonly property string fg0: "#FFFFFFFF"
		readonly property string border0: "#4F878787"
		readonly property string bg0Hover: "#1F9c9c9c"
		readonly property string bg0Active: "#2bc9c9c9"
	}
	readonly property QtObject font: QtObject {
		readonly property string family: "Noto Sans"
		readonly property int pointSize: 8
		readonly property int fluentIconPointSize: 16
	}
}
