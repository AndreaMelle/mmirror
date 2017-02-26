#!/bin/sh

export MODE=PRODUCTION

startx /usr/bin/sudo ./node_modules/.bin/electron . -- -nocursor
