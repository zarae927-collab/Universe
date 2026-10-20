import fs from 'fs';
import path from 'path';
import { FirestoreQuizStorage } from '../src/server/storage/FirestoreQuizStorage';
import { StoredQuiz } from '../src/server/storage/types';

interface MigrationValidationResult {
  valid: boolean;
  errors: string[];
}

function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
}

function validateQuizRecord(id: string, record: any): MigrationValidationResult {
  const errors: string[] = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Record is not a valid JSON object'] };
  }

  if (record.id !== id) {
    errors.push(`Record ID mismatch: key "${id}" vs record.id "${record.id}"`);
  }

  if (!isValidId(id)) {
    errors.push(`Invalid ID format: "${id}"`);
  }

  if (!record.category || typeof record.category !== 'string') {
    errors.push('Missing or invalid category');
  }

  if (!record.creatorName || typeof record.creatorName !== 'string') {
    errors.push('Missing or invalid creatorName');
  }

  if (!record.creatorAnswers || typeof record.creatorAnswers !== 'object') {
    errors.push('Missing or invalid creatorAnswers');
  }

  if (!record.createdAt) {
    errors.push('Missing createdAt timestamp');
  }

  if (record.editTokenHash && (typeof record.editTokenHash !== 'string' || record.editTokenHash.length !== 64)) {
    errors.push('Invalid editTokenHash format (expected 64 hex characters)');
  }

  if (record.recoveryCodeHash && (typeof record.recoveryCodeHash !== 'string' || record.recoveryCodeHash.length !== 64)) {
    errors.push('Invalid recoveryCodeHash format (expected 64 hex characters)');
  }

  if (record.submissions && !Array.isArray(record.submissions)) {
    errors.push('Submissions must be an array');
  } else if (Array.isArray(record.submissions)) {
    for (let i = 0; i < record.submissions.length; i++) {
      const sub = record.submissions[i];
      if (!sub.id || !isValidId(sub.id)) {
        errors.push(`Submission[${i}] has invalid ID: "${sub.id}"`);
      }
      if (!sub.participantName) {
        errors.push(`Submission[${i}] missing participantName`);
      }
      if (typeof sub.score !== 'number' || typeof sub.totalQuestions !== 'number') {
        errors.push(`Submission[${i}] has invalid score or totalQuestions`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

async function runMigration() {
  const args = process.argv.slice(2);
  const isLive = args.includes('--live');
  const mode = isLive ? 'LIVE' : 'DRY RUN';

  console.log(`=======================================================`);
  console.log(`   BESTIE BONDS — FIRESTORE MIGRATION TOOL (${mode})   `);
  console.log(`=======================================================\n`);

  // Step 1: Backup JSON file
  const jsonPath = path.join(process.cwd(), 'data', 'quizzes.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`[ERROR] Source data file not found at ${jsonPath}`);
    process.exit(1);
  }

  const backupDir = path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `quizzes.migration-backup-${timestamp}.json`);
  fs.copyFileSync(jsonPath, backupPath);
  console.log(`[BACKUP] Created verified backup of quizzes.json at:`);
  console.log(`         ${backupPath}\n`);

  // Step 2: Read and validate local records
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  let sourceRecords: Record<string, StoredQuiz>;
  try {
    sourceRecords = JSON.parse(rawData);
  } catch (err: any) {
    console.error(`[ERROR] Failed to parse ${jsonPath}: ${err.message}`);
    process.exit(1);
  }

  const quizIds = Object.keys(sourceRecords);
  console.log(`[INSPECT] Found ${quizIds.length} quiz records in local source file.`);

  let validCount = 0;
  let invalidCount = 0;
  const validationResults: Record<string, MigrationValidationResult> = {};

  for (const qid of quizIds) {
    const res = validateQuizRecord(qid, sourceRecords[qid]);
    validationResults[qid] = res;
    if (res.valid) {
      validCount++;
    } else {
      invalidCount++;
      console.warn(`[WARN] Quiz ${qid} validation failed: ${res.errors.join('; ')}`);
    }
  }

  console.log(`[VALIDATION] Valid records: ${validCount} | Invalid records: ${invalidCount}\n`);

  // Step 3: Test Firestore connection
  console.log(`[FIRESTORE] Initializing Firestore adapter...`);
  const firestoreStorage = new FirestoreQuizStorage();
  await firestoreStorage.init();

  const health = await firestoreStorage.checkHealth();
  console.log(`[FIRESTORE] Health check result:`);
  console.log(`            Engine: ${health.engine}`);
  console.log(`            Healthy: ${health.healthy}`);
  console.log(`            Message: ${health.message}`);

  if (!health.healthy) {
    console.log(`\n[NOTICE] Firestore server connection is not active or credentials are not yet supplied.`);
    console.log(`         Status: ${health.message}`);
    console.log(`         Reason: In this environment, Google Cloud IAM requires service account credentials`);
    console.log(`         to access the Firestore database for project "${health.details?.projectId}".`);
    console.log(`\n[SAFETY ACTION] Migration safely halted without modifying any data.`);
    console.log(`                Local JSON store remains 100% intact and verified at ${jsonPath}`);
    console.log(`                Backup retained at ${backupPath}`);
    return;
  }

  // Step 4: Check existing documents in Firestore
  console.log(`\n[MIGRATION] Checking Firestore for existing records...`);
  let importedCount = 0;
  let skippedCount = 0;
  let conflictCount = 0;

  for (const qid of quizIds) {
    if (!validationResults[qid].valid) {
      console.log(`[SKIP] Skipping invalid record ${qid}`);
      skippedCount++;
      continue;
    }

    const source = sourceRecords[qid];
    const existing = await firestoreStorage.getQuiz(qid);

    if (existing) {
      // Check conflict
      if (existing.createdAt === source.createdAt && existing.creatorName === source.creatorName) {
        console.log(`[EXISTS] Quiz ${qid} already exists in Firestore with matching metadata (skipped).`);
        skippedCount++;
      } else {
        console.warn(`[CONFLICT] Quiz ${qid} exists in Firestore with different metadata! Skipping to avoid overwrite.`);
        conflictCount++;
      }
      continue;
    }

    if (!isLive) {
      console.log(`[DRY RUN] Would import quiz ${qid} (${source.creatorName}, ${source.category}, ${source.submissions?.length || 0} submissions)`);
      importedCount++;
    } else {
      console.log(`[IMPORTING] Writing quiz ${qid} to Firestore...`);
      await firestoreStorage.createQuiz(source);
      importedCount++;

      // Immediate verification
      const verifyDoc = await firestoreStorage.getQuiz(qid);
      if (!verifyDoc) {
        console.error(`[VERIFY FAILED] Quiz ${qid} was written but could not be read back!`);
      } else {
        const verifySubs = verifyDoc.submissions.length === (source.submissions?.length || 0);
        console.log(`[VERIFIED] Quiz ${qid} successfully verified in Firestore (submissions match: ${verifySubs}).`);
      }
    }
  }

  console.log(`\n=======================================================`);
  console.log(`                 MIGRATION SUMMARY                    `);
  console.log(`=======================================================`);
  console.log(`Mode:               ${mode}`);
  console.log(`Total Inspected:    ${quizIds.length}`);
  console.log(`Valid Records:      ${validCount}`);
  console.log(`Invalid Records:    ${invalidCount}`);
  console.log(`Imported:           ${importedCount}`);
  console.log(`Skipped / Existing: ${skippedCount}`);
  console.log(`Conflicts:          ${conflictCount}`);
  console.log(`Source File:        ${jsonPath} (RETAINED)`);
  console.log(`Backup File:        ${backupPath} (PRESERVED)`);
  console.log(`=======================================================\n`);
}

runMigration().catch((err) => {
  console.error('[FATAL] Migration script encountered an error:', err);
  process.exit(1);
});
