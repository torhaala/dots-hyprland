#!/usr/bin/env bash
XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
CONFIG_DIR="$XDG_CONFIG_HOME/quickshell"
$CONFIG_DIR/ii/scripts/colors/switchwall.sh "$(fd . $(xdg-user-dir PICTURES)/Wallpapers/ -e .png -e .jpg -e .svg | xargs shuf -n1 -e)"
