# https://just.systems

set windows-shell := ["pwsh.exe", "-NoLogo", "-Command"]

set dotenv-load := true

default:
    echo 'Hello, world!'

build:
    npm run build

run:
    npm run dev
