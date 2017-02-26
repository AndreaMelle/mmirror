#!/bin/sh

export MODE=PRODUCTION

startx ./node_modules/.bin/electron . --kiosk -- -nocursor
