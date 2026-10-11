# CV Generator

A small static CV builder written in plain HTML, CSS and JS. It has no build step and no dependencies.

- Edit your CV in the left panel and see the A4 preview update live.
- Your data is stored **only in your browser's localStorage**. The repository ships placeholder sample data and nothing else.
- **EN / DE** switch: each language keeps its own CV content. The photo and design settings are shared. Export uses the language you have selected, and the file is named `<Name>_CV` or `<Name>_Lebenslauf`. To add another language, add an entry to `LANGS` in `app.js`.
- **Export PDF** opens the browser's print dialog. Choose *Save as PDF*.
- **Backup JSON** and **Import JSON** let you move your data between browsers or devices.
- Customization options: accent color, font, and showing or hiding the photo.
- **Google Fonts:** choose *Google Font…* in the Font dropdown and type any family name from [fonts.google.com](https://fonts.google.com). The exported PDF includes the font. The stylesheet is only requested when you select this option. That request sends your IP address to Google, so use a system font if you want no third-party requests at all.

## Run locally

Open `index.html`, or run `python3 -m http.server`.

## Publish on GitHub Pages

Push to GitHub, then go to **Settings → Pages → Deploy from branch → `main` / root**.
