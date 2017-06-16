#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

for i in `seq $1`; do ("$DIR/worker.js") &  done
