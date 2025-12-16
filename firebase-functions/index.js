/**
 * Firebase Cloud Functions for University E-Voting System
 * 
 * This function automatically resets user passwords when they submit
 * a password reset request through the web portal.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

/**
 * Cloud Function: processPasswordReset
 * 
 * Triggers when a PasswordResetTokens document is updated.
 * If password_submitted is true and there's a requested_password,
 * it will update the user's Firebase Auth password automatically.
 */
exports.processPasswordReset = functions.firestore
  .document('PasswordResetTokens/{tokenId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const tokenId = context.params.tokenId;

    // Only process if password was just submitted
    if (afterData.password_submitted && !beforeData.password_submitted) {
      console.log(`Processing password reset for token: ${tokenId}`);
      
      const { user_id, university_id, requested_password, contact_email } = afterData;

      if (!user_id || !requested_password) {
        console.error('Missing user_id or requested_password');
        await change.after.ref.update({
          reset_status: 'failed',
          reset_error: 'Missing required data',
          processed_at: admin.firestore.FieldValue.serverTimestamp()
        });
        return null;
      }

      try {
        // Update the user's password in Firebase Auth
        await auth.updateUser(user_id, {
          password: requested_password
        });

        console.log(`Password updated successfully for user: ${university_id}`);

        // Mark the token as processed
        await change.after.ref.update({
          used: true,
          reset_status: 'success',
          processed_at: admin.firestore.FieldValue.serverTimestamp(),
          // Clear the password for security
          requested_password: admin.firestore.FieldValue.delete()
        });

        // Optional: Update user document to clear any pending flags
        try {
          await db.collection('Users').doc(user_id).update({
            password_reset_pending: false,
            last_password_reset: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (userUpdateError) {
          // User document update is optional, don't fail the function
          console.log('Could not update user document:', userUpdateError.message);
        }

        console.log(`Password reset completed for: ${university_id}`);
        return { success: true };

      } catch (error) {
        console.error('Error resetting password:', error);

        // Mark the token as failed
        await change.after.ref.update({
          reset_status: 'failed',
          reset_error: error.message,
          processed_at: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: false, error: error.message };
      }
    }

    return null;
  });

/**
 * Cloud Function: cleanupExpiredTokens
 * 
 * Scheduled function that runs daily to clean up expired password reset tokens.
 * Tokens older than 24 hours that haven't been used are deleted.
 */
exports.cleanupExpiredTokens = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    console.log('Running expired token cleanup...');

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24);

    try {
      const expiredTokens = await db.collection('PasswordResetTokens')
        .where('created_at', '<', cutoffTime)
        .where('used', '==', false)
        .get();

      const batch = db.batch();
      let count = 0;

      expiredTokens.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });

      if (count > 0) {
        await batch.commit();
        console.log(`Deleted ${count} expired tokens`);
      } else {
        console.log('No expired tokens to delete');
      }

      return { deleted: count };
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      return { error: error.message };
    }
  });

