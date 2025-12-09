# Administrator User Guide

## E-Voting & Polling System - Admin Panel

This guide will help you manage the E-Voting system through the web admin panel.

---

## Table of Contents

1. [Accessing the Admin Panel](#accessing-the-admin-panel)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Users](#managing-users)
4. [Managing Elections](#managing-elections)
5. [Managing Candidates](#managing-candidates)
6. [Managing Polls](#managing-polls)
7. [Viewing Results](#viewing-results)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 1. Accessing the Admin Panel

### Login

1. **Open Admin Panel**
   - Navigate to: `https://your-admin-panel-url.com`
   - Or open `index.html` if running locally

2. **Enter Credentials**
   - **Email:** Your admin email address
   - **Password:** Your admin password

3. **Click "Login"**
   - You'll be taken to the dashboard

### Initial Setup

First-time administrators should:
- Change default password
- Update profile information
- Familiarize with dashboard layout

---

## 2. Dashboard Overview

### Main Sections

The admin panel is divided into sections accessible from the left sidebar:

1. **📊 Overview** - Dashboard with statistics
2. **🗳️ Elections** - Manage elections
3. **👤 Candidates** - Manage candidates
4. **📋 Polls** - Manage polls
5. **👥 Users** - Manage student accounts
6. **📈 Results** - View results and analytics

### Dashboard Statistics

The overview page shows:
- **Total Elections:** Number of all elections
- **Total Polls:** Number of all polls
- **Total Users:** Number of registered students
- **Total Votes Cast:** Across all elections and polls

---

## 3. Managing Users

### Viewing Users

1. Click **"Users"** in the sidebar
2. You'll see a table with:
   - Name
   - University ID
   - Faculty
   - Major
   - Role (voter/admin)
   - Status (Active/Inactive)
   - Action buttons

### Adding a User

1. Click **"+ Add User"**
2. Fill in the form:
   - Name
   - University ID (must be unique)
   - Faculty (select from dropdown)
   - Major
   - Role (voter or admin)
   - Initial password
3. Click **"Create"**

### Editing a User

1. Find the user in the list
2. Click **"Edit"**
3. Modify fields as needed
4. **Note:** Cannot change University ID
5. Click **"Save"**

### Deactivating/Activating a User

1. Find the user
2. Click **"Edit"**
3. Toggle **"Is Active"** status
4. Click **"Save"**

**Note:** Inactive users cannot login or vote.

### Deleting a User

⚠️ **Warning:** This action cannot be undone.

1. Find the user
2. Click **"Delete"**
3. Confirm the action

**Best Practice:** Consider deactivating instead of deleting.

---

## 4. Managing Elections

### Creating an Election

1. Click **"Elections"** in sidebar
2. Click **"+ Create Election"**
3. Fill in the form:

#### Election Details
- **Title:** Election name (e.g., "Engineering Student Council 2025")
- **Description:** Brief description of the election
- **Faculty Scope Type:** Choose one:
  - `SINGLE_FACULTY`: One faculty only
  - `MULTI_FACULTY`: Multiple selected faculties
  - `ALL_FACULTIES`: Open to all students
- **Faculty Scope:** Select applicable faculties (if not ALL)
- **Start Date & Time:** When voting begins
- **End Date & Time:** When voting ends
- **Status:** Choose one:
  - `draft`: Not visible to students
  - `scheduled`: Visible but not yet active
  - `active`: Currently accepting votes
  - `closed`: Voting ended

4. Click **"Create Election"**

### Editing an Election

1. Find the election in the list
2. Click **"Edit"**
3. Modify fields
4. Click **"Save"**

**Important:**
- Cannot edit while votes are being cast
- Changing dates may affect ongoing voting
- Changing faculty scope may exclude existing votes

### Election Status Management

**Status Workflow:**
```
draft → scheduled → active → closed
```

- **Draft:** Working on election details
- **Scheduled:** Students can see it, voting not started
- **Active:** Voting is live
- **Closed:** Voting ended, results available

### Deleting an Election

⚠️ **Warning:** This deletes all associated votes and candidates.

1. Find the election
2. Click **"Delete"**
3. Confirm deletion

**Best Practice:** Close elections instead of deleting them for record-keeping.

---

## 5. Managing Candidates

### Adding a Candidate

1. Click **"Candidates"** in sidebar
2. Click **"+ Add Candidate"**
3. Fill in the form:
   - **Name:** Candidate's full name
   - **Election:** Select from dropdown (must create election first)
   - **Faculty:** Candidate's faculty
   - **Bio:** Campaign manifesto or bio
   - **Photo:** Upload candidate photo (optional)
4. Click **"Create"**

### Editing a Candidate

1. Find the candidate
2. Click **"Edit"**
3. Modify fields
4. Click **"Save"**

### Deleting a Candidate

⚠️ **Warning:** Votes for this candidate will remain but show as orphaned.

1. Find the candidate
2. Click **"Delete"**
3. Confirm deletion

**Best Practice:** Only delete before voting starts.

### Candidate Photo Guidelines

- **Format:** JPG or PNG
- **Size:** Max 5MB
- **Dimensions:** 500x500px recommended
- **Content:** Professional headshot

---

## 6. Managing Polls

### Creating a Poll

1. Click **"Polls"** in sidebar
2. Click **"+ Create Poll"**
3. Fill in the form:

#### Poll Details
- **Title:** Poll question (e.g., "Should library hours be extended?")
- **Description:** Additional context (optional)
- **Target Type:** Choose one:
  - `SINGLE_FACULTY`: One faculty
  - `MULTI_FACULTY`: Multiple faculties
  - `ALL_FACULTIES`: All students
- **Target Faculties:** Select faculties (if not ALL)
- **Start Date & Time:** When poll opens
- **End Date & Time:** When poll closes
- **Status:** draft, scheduled, active, or closed

#### Poll Options
- Add at least 2 options
- Common examples:
  - Yes / No
  - Strongly Agree / Agree / Neutral / Disagree / Strongly Disagree
  - Option A / Option B / Option C
- Click **"Add Option"** for each choice
- Set display order

4. Click **"Create Poll"**

### Editing a Poll

1. Find the poll
2. Click **"Edit"**
3. Modify fields
4. **Note:** Cannot edit options after votes are cast
5. Click **"Save"**

### Deleting a Poll

1. Find the poll
2. Click **"Delete"**
3. Confirm deletion

**Best Practice:** Close polls instead of deleting.

---

## 7. Viewing Results

### Election Results

1. Click **"Results"** in sidebar
2. Find the election in "Election Results" section
3. You'll see:
   - Election title
   - Total votes cast
   - Ranked list of candidates with vote counts
   - Percentage breakdown
   - Winner (candidate with most votes)

### Poll Results

1. In **"Results"** section
2. Find the poll in "Poll Results"
3. You'll see:
   - Poll title
   - Total responses
   - Votes per option
   - Percentage distribution
   - Most popular answer

### Exporting Results

**Current Method:** Copy data from screen

**Future Enhancement:** Export to CSV/PDF

### Results Integrity

⚠️ **Important:**
- Results are **read-only**
- Cannot modify vote counts
- All votes are immutable
- Audit trail maintained

---

## 8. Best Practices

### Before an Election

- ✅ Create election in **draft** status
- ✅ Add all candidates
- ✅ Upload candidate photos
- ✅ Review all details
- ✅ Set correct faculty scope
- ✅ Set accurate date/time range
- ✅ Test with a test account
- ✅ Change status to **scheduled**
- ✅ Announce to students

### During an Election

- ✅ Monitor turnout from dashboard
- ✅ Do NOT modify election details
- ✅ Be available for student support
- ✅ Check for technical issues
- ✅ Ensure election remains **active**

### After an Election

- ✅ Wait for end time
- ✅ Change status to **closed**
- ✅ Generate results
- ✅ Announce results
- ✅ Archive election data

### General Guidelines

- 📌 Always use descriptive titles
- 📌 Double-check dates (timezone!)
- 📌 Test faculty scope settings
- 📌 Keep candidate info professional
- 📌 Never modify active elections
- 📌 Backup data regularly
- 📌 Monitor system performance

---

## 9. Troubleshooting

### Cannot Login

**Problem:** Invalid credentials

**Solutions:**
- Verify email and password
- Check caps lock
- Reset password via Firebase Console
- Ensure account has admin role

### Users Cannot Vote

**Checklist:**
- Is election status "active"?
- Is current time within election window?
- Does user's faculty match election scope?
- Has user already voted?
- Is user account active?

### Results Not Showing

**Solutions:**
- Ensure election status is "closed"
- Refresh the page
- Check browser console for errors
- Verify votes exist in database

### Candidates Not Appearing

**Common Issues:**
- Faculty mismatch with election
- Election ID not set correctly
- Candidate marked as inactive

### Data Not Loading

**Solutions:**
- Check internet connection
- Refresh browser
- Clear browser cache
- Check Firebase Console for errors
- Verify Firebase config

---

## Security Guidelines

### Password Management

- Use strong passwords (min 12 characters)
- Never share admin credentials
- Change password regularly
- Use unique password

### Access Control

- Only grant admin access to trusted personnel
- Review admin accounts regularly
- Remove admin access when no longer needed

### Data Protection

- Never export user passwords
- Keep student data confidential
- Follow university privacy policies
- Report security incidents immediately

---

## System Maintenance

### Regular Tasks

**Weekly:**
- Review active elections/polls
- Check for technical issues
- Monitor user registrations

**Monthly:**
- Review system performance
- Update documentation
- Backup data

**After Each Election:**
- Archive results
- Review feedback
- Update processes

---

## Getting Help

### Support Resources

- **Technical Documentation:** See TECHNICAL_DOCUMENTATION.md
- **Firebase Console:** https://console.firebase.google.com
- **System Issues:** Contact IT Support

### Reporting Issues

When reporting issues, include:
- What you were trying to do
- Steps to reproduce
- Error messages (screenshot)
- Browser and version
- Timestamp

---

## Appendix: Quick Reference

### Election Status Transitions

```
draft → scheduled → active → closed
```

### Faculty Scope Types

- `SINGLE_FACULTY`: One faculty
- `MULTI_FACULTY`: Selected faculties
- `ALL_FACULTIES`: All students

### User Roles

- `voter`: Regular student
- `admin`: Administrator

### Common Tasks

| Task | Location | Action |
|------|----------|--------|
| Create Election | Elections → + Create | Fill form |
| Add Candidate | Candidates → + Add | Fill form |
| View Results | Results → Select Election | View |
| Manage Users | Users → Edit User | Modify |
| Create Poll | Polls → + Create | Fill form |

---

**Administrator Guide Version:** 1.0.0  
**Last Updated:** November 13, 2025  
**© 2025 University E-Voting System**

