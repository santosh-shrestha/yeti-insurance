# Form submissions → Google Sheets and EZLynx

Website forms are captured by **Netlify Forms**. From there, each new submission can go to:

1. **A Google Sheet.** This is free, takes about 10 minutes to set up, and needs no other tools. See Option A.
2. **EZLynx**, created as a new applicant or prospect. This needs Zapier. See Option B.

You can use both at the same time.

Every form now includes a hidden **Page** field, so you can see which page a lead came from (for example `/commercial-insurance-texas/workers-compensation/`).

| Form | Fields |
|---|---|
| `quote` | name, phone, email, coverage (Business / Home / Auto / Home + Auto), zip, message, page |
| `claim-notice` | name, phone, claim_type, policy_number, description, page |
| `contact` | name, phone, email, message, page |
| `service-request` | request_type, name, phone, email, policy_number, details, page |

---

## Option A: Google Sheet (free)

### 1. Create the sheet and script
1. In Google Drive, create a new sheet named **"Yeti Website Leads"**. Use the company Google account.
2. Open **Extensions → Apps Script**.
3. Delete the starter code, paste in everything from `integrations/google-sheets-webhook.gs`, and save.
4. On the first line, change `SECRET_TOKEN` to a long random string, for example `yeti-9f3k2Lq8vX1m`. Save again.

### 2. Deploy it as a web app
1. Click **Deploy → New deployment**, then the gear icon, then **Web app**.
2. Set **Execute as** to *Me* and **Who has access** to *Anyone*.
   - "Anyone" is required so that Netlify can send submissions to it.
   - The secret token blocks everyone else.
3. Click **Deploy** and approve the permissions. Google will warn that the app isn't verified. Choose **Advanced → Go to project**; this is your own script.
4. Copy the **Web app URL**. It ends in `/exec`.
5. Optional check: open that URL in your browser. It should say *"Yeti Insurance form webhook is running."*

### 3. Connect Netlify → Sheet (recommended: Netlify function)
The site includes `netlify/functions/submission-created.js`. Netlify runs it automatically after every **verified** submission, and it forwards the submission to the sheet.
1. In Netlify, go to **Site configuration → Environment variables → Add a variable**.
   - Key: `SHEETS_WEBHOOK_URL`
   - Value: your web app URL plus `?token=YOUR-TOKEN`
2. Push or redeploy the site.
3. Don't use the "HTTP POST request" form notification. Apps Script replies with a redirect, so Netlify counts every call as a failure and eventually turns the notification off.

### 3c. Alternative: send directly from the website
1. In `src/site.js`, set `sheetsUrl` to your Web app URL (the one ending in `/exec`).
2. Set `sheetsToken` to the same secret you used on line 13 of the script.
3. Run `git add -A && git commit -m "Connect Google Sheet" && git push`.

Once this is live, every successful form submission is also copied straight to the sheet.

### 3b. Alternative: connect through a Netlify webhook
This only works if your Netlify plan has a **Form submission notifications** section. The general "HTTP POST request" option under *Deploy notifications* only fires on site builds, not form submissions.
1. In Netlify, go to **Site configuration → Notifications → Emails and webhooks → Form submission notifications → Add notification → HTTP POST request**.
2. Set **Event** to *New form submission* and **Form** to *Any form*.
3. Set **URL to notify** to your Web app URL plus `?token=` and your secret. For example:
   `https://script.google.com/macros/s/AKfy.../exec?token=yeti-9f3k2Lq8vX1m`
4. Save.

### 4. Test
Submit a form on the live site, or run `forms-test.js`. Within a few seconds, a tab named after the form (e.g. **quote**) should appear in the sheet with the new row.

**Notes**
- Netlify only sends **verified** submissions to the webhook. Anything its spam filter catches stays in Netlify → Forms → Spam.
- If you edit the script later, publish the change with **Deploy → Manage deployments → Edit → New version**. This keeps the same URL.

---

## Option B: EZLynx (via Zapier)

EZLynx doesn't accept website forms directly, but its **Zapier app** can create applicants and prospects from new form submissions.

**You'll need:**
- A Zapier plan that allows multi-step Zaps.
- Your EZLynx login, and possibly API access enabled by EZLynx support.
- The **Lead Channel / Lead Source** you want web leads tagged with, created in EZLynx first. Zapier users report a *"LeadChannelID and/or Lead Channel Name are invalid"* error when the name doesn't exactly match what's set up in EZLynx.

**Suggested Zap:**
1. **Trigger:** Netlify, *New Form Submission*. Select the site and the **quote** form.
2. **Paths by Zapier:**
   - **Path 1:** *coverage* = `commercial` → **EZLynx: Create Commercial Prospect/Applicant**. Map name, phone, email, ZIP and message (as a note), and set the lead source to "Website".
   - **Path 2:** any other coverage (home, auto, bundle) → **EZLynx: Create Personal Applicant**, mapped the same way.
3. **Optional:** add a **Google Sheets: Create Spreadsheet Row** step to log every lead. If you set this up, you don't need Option A.

**Other forms:**
- **contact** submissions can also create EZLynx prospects.
- **claim-notice** and **service-request** are existing-client requests. They're better as email alerts or Sheet rows than as new EZLynx applicants.

The exact EZLynx actions and required fields depend on your EZLynx account. Run one test submission through the Zap before turning it on.

---

## Live Google reviews on the website

The reviews section loads up to 3 recent reviews, plus the live rating and review count, from `netlify/functions/google-reviews.js`. Until this is set up, or if Google is unreachable, the section shows the static "Rated 4.9 on Google" badge instead.

1. In Google Cloud Console, create a project, enable **Places API (New)** and set up billing. The function caches results for 24 hours, so it calls Google about once a day.
2. Create an **API key** and restrict it to *Places API (New)*.
3. Find your **Place ID** with Google's Place ID Finder. Search "Yeti Insurance Agency, Irving". The ID starts with `ChIJ…`.
4. In Netlify, add two environment variables, then redeploy:
   - `GOOGLE_PLACES_API_KEY`
   - `GOOGLE_PLACE_ID`
5. Check that it works by opening `https://<your-site>/.netlify/functions/google-reviews`. You should see `"ok":true` and a list of reviews.

Google decides which reviews it returns (its 5 "most relevant"). The site shows the first 3 that have text, with the reviewer's name and a link to Google, as Google's attribution rules require.
