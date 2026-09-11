MOC V63 — Compact Core Activity Storage

Recommendation implemented:
DO NOT create new columns for every date/month/meeting.
That makes Sheets extremely wide, harder to query, and eventually hits column limits.

Instead, V63 keeps the existing normalized structure but uses UPSERT:
save again to the same natural record -> UPDATE the row, not append a duplicate.

Core rules:
1. Attendance
   Already compact in the existing system:
   one row per Student ID + Class ID + Date.
   Saving attendance again updates the same row.

2. Monthly Learning Plan
   Already compact:
   one row per Class ID + Month + Meeting Number.
   Editing a meeting updates that row.

3. Learning Journal
   Already compact:
   one row per Class ID + Date + Meeting Number.
   Editing the journal updates that row.

4. Student Notes
   V63 improvement:
   one manual note per Student ID + Class ID + Date.
   Saving again on the same date updates the row.

5. Payment Confirmations
   If a payment proof was rejected and the student resubmits for the same
   Student ID + Period + Category, the rejected row is reused and updated.
   Pending submissions stay blocked.
   Verified payments cannot be submitted again.

6. Data Pembayaran
   - Verifying the same Confirmation ID updates the existing payment row.
   - Historical payments use Student ID + Category + Period as the natural key,
     updating the same row instead of appending duplicates.

Optional one-time maintenance:
Run compactCoreActivitySheetsV63() manually in Apps Script ONCE if you want
to remove old exact duplicates in:
- Absensi
- Monthly Learning Plan
- Learning Journal
- Student Notes

It keeps the latest duplicate row and does not compact Data Pembayaran,
because distinct payment transactions must not be accidentally deleted.

Deployment:
Only Code.gs changed.
Deploy Apps Script -> Manage deployments -> Edit -> New version -> Deploy.
