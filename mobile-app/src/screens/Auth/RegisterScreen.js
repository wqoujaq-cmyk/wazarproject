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
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { registerUser } from '../../services/authService';
import { validateRegistrationForm } from '../../utils/validation';
import { FACULTIES } from '../../config/firebase';
import COLORS from '../../styles/colors';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    universityId: '',
    faculty: '',
    major: '',
    password: '',
    confirmPassword: '',
    photoUri: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);

  const facultyOptions = Object.values(FACULTIES);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to pick image');
      } else {
        const uri = response.assets[0].uri;
        updateField('photoUri', uri);
      }
    });
  };

  const handleRegister = async () => {
    // Validate form
    const validation = validateRegistrationForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register to vote in elections</Text>
        </View>

        {/* Profile Picture */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={handleImagePicker}>
            {formData.photoUri ? (
              <Image source={{ uri: formData.photoUri }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>📷</Text>
                <Text style={styles.photoLabel}>Add Photo (Optional)</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            autoCapitalize="words"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.label}>University ID *</Text>
          <TextInput
            style={[styles.input, errors.universityId && styles.inputError]}
            placeholder="e.g., ENG001, MED123"
            value={formData.universityId}
            onChangeText={(text) => updateField('universityId', text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {errors.universityId && <Text style={styles.errorText}>{errors.universityId}</Text>}

          <Text style={styles.label}>Faculty *</Text>
          <TouchableOpacity
            style={[styles.input, styles.picker, errors.faculty && styles.inputError]}
            onPress={() => setShowFacultyPicker(!showFacultyPicker)}
          >
            <Text style={formData.faculty ? styles.pickerText : styles.pickerPlaceholder}>
              {formData.faculty || 'Select your faculty'}
            </Text>
          </TouchableOpacity>
          {errors.faculty && <Text style={styles.errorText}>{errors.faculty}</Text>}

          {showFacultyPicker && (
            <View style={styles.pickerOptions}>
              {facultyOptions.map((faculty) => (
                <TouchableOpacity
                  key={faculty}
                  style={styles.pickerOption}
                  onPress={() => {
                    updateField('faculty', faculty);
                    setShowFacultyPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{faculty}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Major/Department *</Text>
          <TextInput
            style={[styles.input, errors.major && styles.inputError]}
            placeholder="e.g., Computer Science"
            value={formData.major}
            onChangeText={(text) => updateField('major', text)}
            autoCapitalize="words"
          />
          {errors.major && <Text style={styles.errorText}>{errors.major}</Text>}

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="At least 8 characters"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 40,
  },
  photoLabel: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
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
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
  },
  picker: {
    justifyContent: 'center',
  },
  pickerText: {
    color: COLORS.textPrimary,
  },
  pickerPlaceholder: {
    color: COLORS.gray500,
  },
  pickerOptions: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: -12,
    marginBottom: 16,
    maxHeight: 200,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;

