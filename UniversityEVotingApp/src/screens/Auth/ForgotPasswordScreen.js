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

      // Send password reset request email via EmailJS
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
          },
        }),
      });

      if (response.ok) {
        setSent(true);
        Alert.alert(
          'Request Sent',
          `A password reset request has been sent to your email (${contactEmail}). Please check your inbox and follow the instructions.`,
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
                {sent ? 'Request Sent' : 'Send Reset Link'}
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
          <Text style={styles.helpText}>
            If you don't receive an email, please contact the administrator.
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
    marginBottom: 20,
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
    alignItems: 'center',
  },
  helpText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;

