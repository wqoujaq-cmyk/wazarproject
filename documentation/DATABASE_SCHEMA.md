# Database Schema Documentation

## E-Voting & Polling Application

---

## Overview

This document describes the complete Firestore database schema for the E-Voting application. The database is designed to ensure data integrity, security, and efficient querying.

---

## Collections

### 1. Users

Stores student and admin account information.

**Collection Path:** `/Users/{userId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | Yes | Firebase Auth UID (same as document ID) |
| university_id | string | Yes | Unique university ID (e.g., ENG001) |
| name | string | Yes | Full name of the user |
| faculty | string | Yes | User's faculty (e.g., Engineering, Medicine) |
| major | string | Yes | User's major/department |
| photo_url | string | No | URL to profile picture in Firebase Storage |
| role | string | Yes | User role: "voter" or "admin" |
| is_active | boolean | Yes | Whether the account is active |
| created_at | timestamp | Yes | Account creation timestamp |

**Indexes:**
- `university_id` (unique constraint enforced at application level)
- `faculty` (for filtering by faculty)
- `role` (for admin queries)

**Example Document:**
```json
{
  "user_id": "abc123xyz",
  "university_id": "ENG001",
  "name": "John Doe",
  "faculty": "Engineering",
  "major": "Computer Science",
  "photo_url": "https://storage.googleapis.com/...",
  "role": "voter",
  "is_active": true,
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

### 2. Elections

Stores formal election information.

**Collection Path:** `/Elections/{electionId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| election_id | string | Yes | Auto-generated document ID |
| title | string | Yes | Election title |
| description | string | No | Election description |
| faculty_scope_type | string | Yes | "SINGLE_FACULTY", "MULTI_FACULTY", or "ALL_FACULTIES" |
| faculty_scope | array | Conditional | Array of faculty names (empty if ALL_FACULTIES) |
| start_date | timestamp | Yes | Election start date/time |
| end_date | timestamp | Yes | Election end date/time |
| status | string | Yes | "draft", "scheduled", "active", or "closed" |
| created_by | string | No | Admin user ID who created the election |
| created_at | timestamp | Yes | Creation timestamp |

**Indexes:**
- Composite: `status + start_date`
- Composite: `faculty_scope (array-contains) + status`

**Example Document:**
```json
{
  "election_id": "elec_001",
  "title": "Engineering Student Council Election 2025",
  "description": "Vote for your engineering student representatives",
  "faculty_scope_type": "SINGLE_FACULTY",
  "faculty_scope": ["Engineering"],
  "start_date": "2025-02-01T09:00:00Z",
  "end_date": "2025-02-03T17:00:00Z",
  "status": "scheduled",
  "created_by": "admin_uid_123",
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

### 3. Candidates

Stores candidate information for elections.

**Collection Path:** `/Candidates/{candidateId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidate_id | string | Yes | Auto-generated document ID |
| election_id | string | Yes | Reference to Elections collection |
| name | string | Yes | Candidate full name |
| faculty | string | Yes | Candidate's faculty |
| bio | string | No | Candidate biography/manifesto |
| photo_url | string | No | URL to candidate photo |
| created_at | timestamp | Yes | Creation timestamp |

**Indexes:**
- Composite: `election_id + faculty`

**Example Document:**
```json
{
  "candidate_id": "cand_001",
  "election_id": "elec_001",
  "name": "Jane Smith",
  "faculty": "Engineering",
  "bio": "I promise to improve student facilities...",
  "photo_url": "https://storage.googleapis.com/...",
  "created_at": "2025-01-16T10:00:00Z"
}
```

---

### 4. Votes

Stores election votes. **Critical: One vote per user per election.**

**Collection Path:** `/Votes/{voteId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vote_id | string | Yes | Auto-generated document ID |
| election_id | string | Yes | Reference to Elections collection |
| user_id | string | Yes | Firebase Auth UID of voter |
| candidate_id | string | Yes | Reference to Candidates collection |
| faculty | string | Yes | Voter's faculty (denormalized for analytics) |
| timestamp | timestamp | Yes | Vote submission timestamp |

**Constraints:**
- **One vote per user per election** (enforced by Firestore security rules and application logic)
- Votes are **immutable** (cannot be updated or deleted)

**Indexes:**
- Composite: `election_id + user_id` (to check if user voted)
- Composite: `user_id + timestamp` (for user's voting history)
- Composite: `election_id + candidate_id` (for vote counting)

**Example Document:**
```json
{
  "vote_id": "vote_001",
  "election_id": "elec_001",
  "user_id": "abc123xyz",
  "candidate_id": "cand_001",
  "faculty": "Engineering",
  "timestamp": "2025-02-01T14:30:00Z"
}
```

---

### 5. Polls

Stores poll (quick voting) information.

**Collection Path:** `/Polls/{pollId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| poll_id | string | Yes | Auto-generated document ID |
| title | string | Yes | Poll question/title |
| description | string | No | Poll description |
| target_type | string | Yes | "SINGLE_FACULTY", "MULTI_FACULTY", or "ALL_FACULTIES" |
| target_faculties | array | Conditional | Array of faculty names (empty if ALL_FACULTIES) |
| start_date | timestamp | Yes | Poll start date/time |
| end_date | timestamp | Yes | Poll end date/time |
| status | string | Yes | "draft", "scheduled", "active", or "closed" |
| created_by | string | No | Admin user ID who created the poll |
| created_at | timestamp | Yes | Creation timestamp |

**Indexes:**
- Composite: `status + start_date`
- Composite: `target_faculties (array-contains) + status`

**Example Document:**
```json
{
  "poll_id": "poll_001",
  "title": "Should we extend library hours?",
  "description": "Vote on whether library should be open 24/7",
  "target_type": "ALL_FACULTIES",
  "target_faculties": [],
  "start_date": "2025-02-05T09:00:00Z",
  "end_date": "2025-02-07T17:00:00Z",
  "status": "active",
  "created_by": "admin_uid_123",
  "created_at": "2025-02-04T10:00:00Z"
}
```

---

### 6. PollOptions

Stores answer options for polls.

**Collection Path:** `/PollOptions/{optionId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| option_id | string | Yes | Auto-generated document ID |
| poll_id | string | Yes | Reference to Polls collection |
| text | string | Yes | Option text (e.g., "Yes", "No", "Maybe") |
| order | number | Yes | Display order (0, 1, 2, ...) |

**Indexes:**
- Composite: `poll_id + order`

**Example Documents:**
```json
[
  {
    "option_id": "opt_001",
    "poll_id": "poll_001",
    "text": "Yes",
    "order": 0
  },
  {
    "option_id": "opt_002",
    "poll_id": "poll_001",
    "text": "No",
    "order": 1
  },
  {
    "option_id": "opt_003",
    "poll_id": "poll_001",
    "text": "Maybe",
    "order": 2
  }
]
```

---

### 7. PollVotes

Stores poll votes. **Critical: One vote per user per poll.**

**Collection Path:** `/PollVotes/{pollVoteId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| poll_vote_id | string | Yes | Auto-generated document ID |
| poll_id | string | Yes | Reference to Polls collection |
| user_id | string | Yes | Firebase Auth UID of voter |
| option_id | string | Yes | Reference to PollOptions collection |
| faculty | string | Yes | Voter's faculty (denormalized for analytics) |
| timestamp | timestamp | Yes | Vote submission timestamp |

**Constraints:**
- **One vote per user per poll** (enforced by Firestore security rules and application logic)
- Poll votes are **immutable** (cannot be updated or deleted)

**Indexes:**
- Composite: `poll_id + user_id` (to check if user voted)
- Composite: `user_id + timestamp` (for user's voting history)
- Composite: `poll_id + option_id` (for vote counting)

**Example Document:**
```json
{
  "poll_vote_id": "pvote_001",
  "poll_id": "poll_001",
  "user_id": "abc123xyz",
  "option_id": "opt_001",
  "faculty": "Engineering",
  "timestamp": "2025-02-05T15:45:00Z"
}
```

---

## Entity Relationships

```
Users (1) ←──→ (M) Votes
Users (1) ←──→ (M) PollVotes
Elections (1) ←──→ (M) Candidates
Elections (1) ←──→ (M) Votes
Polls (1) ←──→ (M) PollOptions
Polls (1) ←──→ (M) PollVotes
Candidates (1) ←──→ (M) Votes
PollOptions (1) ←──→ (M) PollVotes
```

---

## Security Rules Summary

- **Users:** Users can read/update their own profile; admins can read all
- **Elections/Polls:** All authenticated users can read; only admins can write
- **Candidates/PollOptions:** All authenticated users can read; only admins can write
- **Votes/PollVotes:** 
  - **Cannot be read by anyone** (privacy)
  - Can only be created once per user per election/poll
  - **Cannot be updated or deleted** (immutable)

---

## Query Examples

### Get active elections for a faculty
```javascript
firestore()
  .collection('Elections')
  .where('status', '==', 'active')
  .where('faculty_scope', 'array-contains', 'Engineering')
  .get();
```

### Check if user voted in an election
```javascript
firestore()
  .collection('Votes')
  .where('election_id', '==', 'elec_001')
  .where('user_id', '==', 'abc123xyz')
  .limit(1)
  .get();
```

### Get poll results
```javascript
firestore()
  .collection('PollVotes')
  .where('poll_id', '==', 'poll_001')
  .get();
```

### Get candidates for an election
```javascript
firestore()
  .collection('Candidates')
  .where('election_id', '==', 'elec_001')
  .where('faculty', '==', 'Engineering')
  .get();
```

---

## Data Migration

For initial setup or testing, use the following order:

1. Create admin user in Authentication
2. Create admin document in Users collection
3. Create Elections
4. Create Candidates for Elections
5. Create Polls
6. Create PollOptions for Polls
7. Votes and PollVotes are created by users

---

## Backup and Archiving

- Regular Firestore backups should be scheduled
- Closed elections/polls can be archived after a retention period
- Votes should be retained for audit purposes

---

**Last Updated:** November 13, 2025

