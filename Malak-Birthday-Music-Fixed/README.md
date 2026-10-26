# Malak birthday website — 5 chapters + Spotify soundtrack

Welcome → Catch 12 Hearts game → Letter → Birthday Celebration → Songs & Secret. **The fourth (three gifts) page was removed**. The cake/wishes page was already removed in the earlier version.

## Opening

Extract this ZIP; open `index.html` in Chrome, Edge, or Firefox. Keep `index.html`, `styles.css`, `animations.css`, `script.js`, and `assets/` together. A one-file version is also provided separately.

## Music

* Background music: **No. 1 Party Anthem — Arctic Monkeys** (`5TTGoX70AFrTvuEtqHK37S`). Opening the gift asks the Spotify embed to play. Some browser/Spotify configurations block this request; tap Play in the floating Spotify player. The music-note button at the top toggles that player.
* Four song entries: Helaf El Amar, Garahouna, Narein, and Narein (repeat). The two Narein links you supplied are identical, so there are **three unique songs**.
* In-page Spotify embed players use the officially documented iframe setup (including `allow="autoplay; encrypted-media"`). Song availability, full playback, sign-in and some autoplay restrictions are controlled by Spotify; **no HTML edit can guarantee full Spotify playback for every visitor**.
* When embedded Spotify fails, there is an audio-file picker for the background song and another on the playlist page. They accept **your own legally obtained audio file** for browser playback. File-picking is local to that visit, not permanently bundled. To share local audio files, ask for files to be bundled, ensuring you have rights to share them.

The site does not extract/copy Spotify audio. In-page playback may work more reliably on an HTTPS-hosted site than from `file://` URLs.
