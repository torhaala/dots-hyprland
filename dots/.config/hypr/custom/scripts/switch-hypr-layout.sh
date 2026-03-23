#!/bin/bash

# Get current layout (parse the 'str:' value from hyprctl output)
current_layout=$(hyprctl getoption general:layout | grep 'str:' | awk '{print $2}')

# Determine next layout
case "$current_layout" in
    "dwindle")
        next_layout="master"
        ;;
    "master")
        next_layout="scrolling"
        ;;
    "scrolling")
        next_layout="dwindle"
        ;;
    *)
        # Default fallback
        next_layout="dwindle"
        ;;
esac

# Apply the next layout
hyprctl keyword general:layout "$next_layout"

# Optional: Notify user
echo "Switched to $next_layout layout"