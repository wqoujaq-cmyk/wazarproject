import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { firestore, COLLECTIONS } from '../../config/firebase';
import COLORS from '../../styles/colors';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_ly8htul',
  templateId: 'template_cr3mrly',  // Password reset template
  publicKey: 'EPO61S4tPNKPKy6UH',
};

// Password Reset Portal URL - UPDATE THIS with your actual hosted URL
const RESET_PORTAL_URL = 'https://wazar-1a851.web.app/reset-password.html';

// Generate a 6-digit reset token
const generateResetToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [universityId, setUniversityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetRequest = async () => {
    if (!universityId.trim()) {
      Alert.alert('Error', 'Please enter your University ID');
      return;
    }

    setLoading(true);

    try {
      // Find user by university_id in Firestore
      const usersSnapshot = await firestore()
        .collection(COLLECTIONS.USERS)
        .where('university_id', '==', universityId.toUpperCase())
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        Alert.alert('Not Found', 'No account found with this University ID');
        setLoading(false);
        return;
      }

      const userData = usersSnapshot.docs[0].data();
      const contactEmail = userData.contact_email;

      if (!contactEmail) {
        Alert.alert(
          'No Email',
          'No contact email found for this account. Please contact the administrator.'
        );
        setLoading(false);
        return;
      }

      // Generate a unique reset token
      const resetToken = generateResetToken();
      
      // Store the token in Firestore
      await firestore()
        .collection('PasswordResetTokens')
        .add({
          university_id: universityId.toUpperCase(),
          user_id: usersSnapshot.docs[0].id,
          token: resetToken,
          created_at: new Date(),
          used: false,
          contact_email: contactEmail,
        });

      // Create reset link with token and ID
      const resetLink = `${RESET_PORTAL_URL}?token=${resetToken}&id=${universityId.toUpperCase()}`;

      // Send password reset email via EmailJS
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_CONFIG.serviceId,
          template_id: EMAILJS_CONFIG.templateId,
          user_id: EMAILJS_CONFIG.publicKey,
          template_params: {
            to_name: userData.name,
            to_email: contactEmail,
            university_id: universityId.toUpperCase(),
            user_name: userData.name,
            reset_token: resetToken,
            reset_link: resetLink,
            expiry_time: '24 hours',
          },
        }),
      });

      if (response.ok) {
        setSent(true);
        Alert.alert(
          'Reset Link Sent! ✉️',
          `A password reset link has been sent to ${contactEmail}.\n\nThe link contains your 6-digit verification code.\n\nThis link will expire in 24 hours.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(
        'Error',
        'Failed to process your request. Please try again or contact the administrator.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>🔑</Text>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your University ID and we'll send a password reset link to your registered email.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>University ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., ENG001"
            value={universityId}
            onChangeText={(text) => setUniversityId(text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!sent}
          />

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              You will receive an email with a 6-digit code and a link to reset your password. The link is valid for 24 hours.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, (loading || sent) && styles.buttonDisabled]}
            onPress={handleResetRequest}
            disabled={loading || sent}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>
                {sent ? '✓ Reset Link Sent' : 'Send Reset Link'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>How it works:</Text>
          <View style={styles.stepContainer}>
            <Text style={styles.step}>1️⃣ Enter your University ID above</Text>
            <Text style={styles.step}>2️⃣ Check your email for the reset link</Text>
            <Text style={styles.step}>3️⃣ Click the link and enter your new password</Text>
            <Text style={styles.step}>4️⃣ Log in with your new password</Text>
          </View>
          <Text style={styles.helpText}>
            If you don't receive an email within 5 minutes, check your spam folder or contact the administrator.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  helpContainer: {
    marginTop: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  stepContainer: {
    marginBottom: 12,
  },
  step: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
    paddingLeft: 4,
  },
  helpText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ForgotPasswordScreen;
