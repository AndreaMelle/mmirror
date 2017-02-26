#!/bin/sh

export MODE=PRODUCTION

xset s 0 0
xset s off
xset s noblank
xset s noexpose
xset -dpms

startx ./node_modules/.bin/electron . --kiosk -- -nocursor
