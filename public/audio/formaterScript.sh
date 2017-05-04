#!/bin/bash

echo "module.exports = {"
for f in *; do
  filename="${f%%.*}"
  echo "    \"$filename\":\"$f\","
done
echo "};"
