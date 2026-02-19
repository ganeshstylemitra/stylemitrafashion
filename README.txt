Style Mitra Fashion (HTML + Admin Panel)

What you get
- Static HTML site (index.html)
- WhatsApp order buttons (auto message)
- Admin panel at /admin (Decap CMS) to edit:
  - Banner title/subtitle/button text/image
  - Categories
  - Products (add/edit/delete)
  - Top bar text
  - WhatsApp number

How to use (Netlify)
1) Upload this folder to a GitHub repo (recommended) and connect the repo to Netlify.
2) In Netlify -> Site settings:
   - Identity: Enable
   - Git Gateway: Enable
   - Invite yourself (email) so you can login.
3) Open: https://YOUR-SITE.netlify.app/admin
4) Edit products, upload images, Save -> Netlify redeploys automatically.

Important
- /content/data.json is the single source of truth.
- WhatsApp number in data.json uses E.164 format: 91 + mobile (no + sign), example: 919284639028
