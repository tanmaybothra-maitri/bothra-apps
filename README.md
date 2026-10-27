# bothra-apps

Home-screen versions of the family event apps. The pages live here (GitHub Pages); the data stays in Google Sheets through the Apps Script web app (`doPost` in `60_Api.gs`).

| App | Link |
|---|---|
| Guest details | https://tanmaybothra-maitri.github.io/bothra-apps/?app=guest-details |
| Travel desk | https://tanmaybothra-maitri.github.io/bothra-apps/?app=logistics |
| Driver | https://tanmaybothra-maitri.github.io/bothra-apps/?app=driver&d=<code> |
| Hotel | https://tanmaybothra-maitri.github.io/bothra-apps/?app=hotel |
| Checklist | https://tanmaybothra-maitri.github.io/bothra-apps/?app=checklist&k=<key> |

## Updating a page
1. Copy the page file from Apps Script into `src/` (same name).
2. `python3 tools/build.py`
3. Commit and push. Live in about a minute.

`shared/bridge.js` stands in for `google.script.run` / `google.script.history`, so the Apps Script pages run unchanged.
