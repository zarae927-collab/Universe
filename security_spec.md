# Firebase Firestore Security Specification

## 1. Data Invariants

1. **Global Isolation & Catch-All Deny:** All unspecified collections and root documents reject any unauthorized read or write operations (`allow read, write: if false;`).
2. **Quiz Structural Integrity:** A Quiz document must contain valid string IDs matching the path variable, a recognized category name, a sanitized creator name (max 100 characters), non-negative totalQuestions, and an ISO timestamp.
3. **Answer Key Secrecy (Anti-Cheating Invariant):** The private answer key document (`/quizzes/{quizId}/private/key`) must NEVER be readable by participants before or during quiz taking. Only creator authenticated writes with appropriate token or matching secret are permitted.
4. **Submission Integrity & Immutability:** Submissions (`/quizzes/{quizId}/submissions/{submissionId}`) represent completed quizzes. Once submitted, a submission is immutable (cannot be altered or updated to change scores or answers).
5. **Score & Percentage Range Clamping:** A participant score must satisfy `score >= 0 && score <= totalQuestions`. The percentage must equal `Math.round((score / totalQuestions) * 100)` or be between 0 and 100.
6. **Path Variable Hardening:** All quiz IDs (`quizId`) and submission IDs (`submissionId`) must adhere to `^[a-zA-Z0-9_\-]+$` and have a length `<= 128`.
7. **No Shadow Updates:** Document mutations cannot introduce unlisted ghost fields or inject arbitrary executable payloads.
8. **Unbounded Array Ban:** Submissions cannot be injected as unbounded arrays directly on parent documents; they reside in the dedicated `/submissions` subcollection.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Test Payloads)

Each of the following 12 payloads is crafted to violate invariants and must trigger `PERMISSION_DENIED`:

### Payload 1: ID Poisoning Attack (Buffer Overflow Attempt)
Attempting to create a quiz with a 2KB junk string ID.
```json
{
  "targetPath": "/quizzes/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa...",
  "operation": "create",
  "data": { "id": "oversized", "category": "friendship", "creatorName": "Hacker", "totalQuestions": 10, "createdAt": "2026-10-18T00:00:00Z" }
}
```

### Payload 2: Answer Key Leak / Direct Client Read
Participant attempts direct read of creator answer key prior to completing the quiz.
```json
{
  "targetPath": "/quizzes/bb_test123/private/key",
  "operation": "get",
  "auth": null
}
```

### Payload 3: Shadow Field Injection (Privilege / Verification Escalation)
Attempting to insert an arbitrary `isAdmin: true` or `verified: true` ghost property into a quiz record.
```json
{
  "targetPath": "/quizzes/bb_test123",
  "operation": "create",
  "data": {
    "id": "bb_test123",
    "category": "friendship",
    "creatorName": "Alex",
    "totalQuestions": 10,
    "createdAt": "2026-10-18T00:00:00Z",
    "isAdmin": true,
    "systemBypass": "granted"
  }
}
```

### Payload 4: Score Tampering on Completed Submission
Participant or attacker tries to overwrite a submission to award themselves 100% score.
```json
{
  "targetPath": "/quizzes/bb_test123/submissions/sub_999",
  "operation": "update",
  "data": { "score": 10, "percentage": 100 }
}
```

### Payload 5: Negative Score Injection
Submitting an impossible negative score value.
```json
{
  "targetPath": "/quizzes/bb_test123/submissions/sub_neg",
  "operation": "create",
  "data": {
    "id": "sub_neg",
    "quizId": "bb_test123",
    "participantName": "Troll",
    "score": -5,
    "totalQuestions": 10,
    "percentage": -50,
    "submittedAt": "2026-10-18T00:00:00Z"
  }
}
```

### Payload 6: Score Greater Than Total Questions (Score Inflation)
Submitting a score higher than the total questions available.
```json
{
  "targetPath": "/quizzes/bb_test123/submissions/sub_over",
  "operation": "create",
  "data": {
    "id": "sub_over",
    "quizId": "bb_test123",
    "participantName": "Cheater",
    "score": 9999,
    "totalQuestions": 10,
    "percentage": 99990,
    "submittedAt": "2026-10-18T00:00:00Z"
  }
}
```

### Payload 7: Mismatched Quiz ID in Subcollection Record (Orphan / Hijack write)
Submission document has an inner `quizId` that points to a completely different quiz.
```json
{
  "targetPath": "/quizzes/bb_victim_quiz/submissions/sub_spoof",
  "operation": "create",
  "data": {
    "id": "sub_spoof",
    "quizId": "bb_different_quiz",
    "participantName": "Impostor",
    "score": 5,
    "totalQuestions": 10,
    "percentage": 50,
    "submittedAt": "2026-10-18T00:00:00Z"
  }
}
```

### Payload 8: Massive Payload Denial of Wallet (Resource Exhaustion)
Injecting a 500KB participant name string.
```json
{
  "targetPath": "/quizzes/bb_test123/submissions/sub_bloat",
  "operation": "create",
  "data": {
    "id": "sub_bloat",
    "quizId": "bb_test123",
    "participantName": "A".repeat(500000),
    "score": 5,
    "totalQuestions": 10,
    "percentage": 50,
    "submittedAt": "2026-10-18T00:00:00Z"
  }
}
```

### Payload 9: Arbitrary Collection Write (Root document poisoning)
Attempting to create documents in arbitrary collections like `/admin` or `/users` without rules.
```json
{
  "targetPath": "/system_configs/default",
  "operation": "create",
  "data": { "allowAllAccess": true }
}
```

### Payload 10: Submission Deletion by Anonymous Participant
Participant attempts to delete another player's leaderboard entry.
```json
{
  "targetPath": "/quizzes/bb_test123/submissions/sub_legit_player",
  "operation": "delete"
}
```

### Payload 11: Quiz Mutation Bypassing Creator Integrity
Participant attempts to edit an existing quiz's question list or title mid-stream.
```json
{
  "targetPath": "/quizzes/bb_test123",
  "operation": "update",
  "data": { "category": "hacked_category", "totalQuestions": 0 }
}
```

### Payload 12: Invalid Path Special Characters Injection
Attempting directory traversal or SQLi-style string injection in path variables.
```json
{
  "targetPath": "/quizzes/../../etc/passwd",
  "operation": "get"
}
```

---

## 3. The Test Runner (`firestore.rules.test.ts`)

The accompanying TypeScript test suite verifies each dirty dozen payload produces a `PERMISSION_DENIED` rejection.
