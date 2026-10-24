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

### 3. Connect Netlify
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
