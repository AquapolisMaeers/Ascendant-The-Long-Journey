# Recorded cooking and woodcutting audio

The following CC0 recordings were downloaded from LaSonotheque and adapted for Ascendant. They are bundled locally; the game never streams them or contacts the source site.

- **Cooking:** "Rissoler a la poele", sound 0314, DenisChardonnet.
  Source: https://lasonotheque.org/rissoler-a-la-poele-s0314.html
  Audio: https://lasonotheque.org/UPLOAD/bwf-fr/0314.wav
- **Woodcutting:** "Hache sur bois", sound 0536, Joseph SARDIN.
  Source: https://lasonotheque.org/hache-sur-bois-s0536.html
  Audio: https://lasonotheque.org/UPLOAD/bwf-fr/0536.wav

License: Creative Commons CC0 1.0 Universal (https://creativecommons.org/publicdomain/zero/1.0/). Both source pages explicitly permit modification and redistribution, including game use.

Changes: DC removal, resampling to 22050 Hz, gentle filtering, shortened/faded action samples, three distinct variants per skill, quiet peak/RMS normalization, and continuous eighteen-second ambience loops. Woodcutting variants contain two recorded axe impacts; Cooking retains the recorded pan sizzle.

Original recordings are in tests/audio_sources/, outside DIST and portable archives. Run tests/build_requested_audio.py to reproduce only these eight runtime WAV files. The broader tests/build_soundscapes.py also reapplies this recording mix at the end of a rebuild. Existing audio preferences and independent Master/Music/SFX/Ambience controls are preserved.
