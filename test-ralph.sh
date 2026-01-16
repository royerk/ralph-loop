#!/bin/bash

TEST_DIR="$(dirname "$0")/test-sandbox"

# Delete and recreate test directory
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

cd "$TEST_DIR"

# Run ralph-loop with a simple prompt
ralph-loop -p "build a small python script that can add, subtract, multiply and divide two numbers"
