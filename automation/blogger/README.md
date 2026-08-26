# DAILY TEST LAB Blogger automation

This folder is the GitHub source of truth for the DAILY TEST LAB Blogger support site.

## Data flow

`content.json` → Google Apps Script → Blogger API v3 → DAILY TEST LAB Blogger

- Blog ID: `5587300283797440679`
- Primary site: `https://dtlabkr.dpdns.org/`
- Sync interval: every 6 hours
- Cost: free-tier Google Apps Script and Blogger
- Local installation: none

## Safety rules

- Creates and updates only; it never deletes Blogger pages or posts.
- A stable content marker and Apps Script properties prevent duplicates.
- A script lock prevents overlapping runs.
- The blog ID in `content.json` must match the fixed target blog ID.
- Script tags, JavaScript URLs, and inline event handlers are rejected.
- Public content validation blocks personal administrator names.
- Google OAuth credentials, verification codes, passwords, and API keys are never stored in GitHub.

## One-time Google setup

The blog owner must complete Google OAuth authorization. This cannot be delegated.

1. Open `https://script.google.com/create` while signed in to the Blogger owner account.
2. Paste `Code.gs` into the editor.
3. In Project Settings, enable **Show appsscript.json manifest file in editor**.
4. Replace the manifest with this folder's `appsscript.json`.
5. Select `setupDailyTestLabBlogger` and click **Run**.
6. Review the requested Google permissions and click **Allow**.

After the first successful run, GitHub content changes are picked up automatically by the six-hour trigger. To sync immediately, run `syncDailyTestLabBlogger`.

## Editing content

Edit only `content.json`, increment `revision`, validate, and merge to `main`.

```bash
node automation/blogger/validate-content.mjs
node automation/blogger/test-sync.mjs
```
