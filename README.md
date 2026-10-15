# StudyFlow — Student Task Tracker

A small, polished student task dashboard built with **HTML, CSS, and vanilla JavaScript** for **MLH Global Hack Week: Hacktoberfest 2026 Challenge 1**.

No frameworks, npm packages, backend, or API keys. Open `index.html` in a browser and it runs.

## Features

- Add study tasks
- Mark tasks complete or incomplete
- Delete tasks
- Live totals for all, completed, and pending tasks
- Progress bar that updates automatically
- Filters: All, Active, Completed
- `localStorage` persistence for tasks
- Dark / light mode toggle, also saved in `localStorage`
- Empty-input validation with a clear error message
- Keyboard-friendly controls, labels, and screen-reader announcements
- Responsive layout for phones and desktops

## Run on macOS

1. Clone or download this folder.
2. In Finder, open the project folder and double-click `index.html`.
   Safari, Chrome, or Firefox will load the app.

Or from Terminal:

```bash
cd ~/Desktop/studyflow-hacktoberfest
open index.html
```

`open` launches the file in your default browser. To pick a browser:

```bash
open -a "Google Chrome" index.html
open -a Safari index.html
```

You do not need Node.js, a package manager, or a local server.

## How to test

1. Type a task such as `Review Chapter 4 notes` and press **Enter** or click **Add Task**.
2. Click **Add Task** with an empty field. You should see a validation message.
3. Check a task complete. Totals and the progress bar should update.
4. Switch filters between **All**, **Active**, and **Completed**.
5. Delete a task.
6. Toggle **Dark / Light** in the header.
7. Refresh the page. Tasks and theme should still be there.

Tasks are stored only in this browser (`localStorage` keys `studyflow-tasks` and `studyflow-theme`). Clearing site data removes them.

## Project files

- `index.html` — structure and accessibility markup
- `style.css` — layout, themes, and responsive styles
- `script.js` — task logic, filters, progress, and persistence

## Challenge notes

Hacktoberfest 2026 is run by MLH and DEV, presented by DigitalOcean. Pull requests no longer count toward rewards; participants collect stickers from events, livestreams, DEV Challenges, and Global Hack Week. Global Hack Week: Hacktoberfest ran 9–15 October 2026. Submit GHW challenges from the week’s dashboard at [ghw.mlh.io/challenges](https://ghw.mlh.io/challenges).

See the [Hacktoberfest 2026 knowledge guide](https://devrelay.com/knowledge/hacktoberfest) and [Global Hack Week guide](https://devrelay.com/knowledge/global-hack-week) for program rules.
