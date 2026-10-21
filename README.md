# extension-tao-clientdiag

[![codecov](https://codecov.io/gh/oat-sa/extension-tao-clientdiag/branch/master/graph/badge.svg)](https://codecov.io/gh/oat-sa/extension-tao-clientdiag)

Extension that allow to check compatibility of operating system/ browser with TAO

# Accessing

## As an Anonymous user

Access the URL: `https://HOSTNAME/taoClientDiagnostic/CompatibilityChecker/index`

## As an Authenticated user

The user needs first to be authenticated before accessing the diagnostic tool.

Access the URL: `https://HOSTNAME/taoClientDiagnostic/Diagnostic/index`

## Microphone and audio output checks

Since extension 9.x defaults, `clientDiag` includes optional testers:

- `taoClientDiagnostic/tools/microphone/tester` — `getUserMedia({ audio: true })`
- `taoClientDiagnostic/tools/audioPlayback/tester` — short Web Audio tone

Installations that override `config/taoClientDiagnostic/clientDiag.conf.php` must copy the `microphone` and `audio_playback` blocks from `config/default/clientDiag.conf.php` (or merge on deploy).
