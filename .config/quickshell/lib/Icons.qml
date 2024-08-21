pragma Singleton
import QtQuick
import Quickshell

Singleton {
	readonly property QtObject fluent: QtObject {
		readonly property string fontFamily: "FluentSystemIcons-Regular"
		readonly property QtObject wifi: QtObject {
			// 
			readonly property string strong: ""
			readonly property string strongBold: ""
			readonly property string good: ""
			readonly property string goodBold: ""
			readonly property string okay: ""
			readonly property string okayBold: ""
			readonly property string weak: ""
			readonly property string weakBold: ""
		}
		readonly property QtObject battery: QtObject {
			// 
			readonly property string d0: ""
			readonly property string d0Bold: ""
			readonly property string d10: ""
			readonly property string d10Bold: ""
			readonly property string d20: ""
			readonly property string d20Bold: ""
			readonly property string d30: ""
			readonly property string d30Bold: ""
			readonly property string d40: ""
			readonly property string d40Bold: ""
			readonly property string d50: ""
			readonly property string d50Bold: ""
			readonly property string d60: ""
			readonly property string d60Bold: ""
			readonly property string d70: ""
			readonly property string d70Bold: ""
			readonly property string d80: ""
			readonly property string d80Bold: ""
			readonly property string d90: ""
			readonly property string c0: ""
			readonly property string c0Line: ""
			readonly property string eco0: ""
			readonly property string eco0Bold: ""
			readonly property string warning: ""
		}
		readonly property QtObject volume: QtObject {
			// 0  1  2  bluetooth  
			readonly property string l0: ""
			readonly property string l1: ""
			readonly property string l2: ""
			readonly property string muted: ""
		}
	}
}
