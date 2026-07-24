import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import api from '../../services/api'; 

import BEOImportSuccessModal from '../../components/BeoModal'; 

export default function AddEventScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  //modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [importResponse, setImportResponse] = useState(null);

  // select the file from device
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
      }
    } catch (error) {
      Alert.alert('Error', 'The PDF file could not be selected.');
    }
  };

  // send File
  const handleUploadBEO = async () => {
    if (!selectedFile) {
      Alert.alert('Attention', 'Please select a BEO (PDF) file first.');
      return;
    }

    setLoading(true);

    try {
      // Create form
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name || 'beo_document.pdf',
        type: selectedFile.mimeType || 'application/pdf',
      });

      const response = await api.post('/api/import/beo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("respondse: ",response)
      setImportResponse(response.data);
      setModalVisible(true);

      setSelectedFile(null);
    } catch (error) {
      console.error('Import Error:', error);
      const errorMessage =
        error.response?.data?.error || 'The BEO file could not be imported.';
      Alert.alert('Import Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModalAndGoHome = () => {
    setModalVisible(false);
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import Events (BEO)</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.subtitle}>
        Upload the BEO document in PDF format to automatically extract and register events.        
        </Text>

        {/* select file here */}
        <TouchableOpacity
          style={[styles.uploadBox, selectedFile && styles.uploadBoxSuccess]}
          onPress={handlePickDocument}
          activeOpacity={0.8}
        >
          <Text style={styles.uploadIcon}>{selectedFile ? '📄' : '☁️'}</Text>

          {selectedFile ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text style={styles.fileSize}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
          ) : (
            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadTitle}>Tap to select PDF</Text>
              <Text style={styles.uploadSubtext}>Supported formats: .pdf</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* to change file*/}
        {selectedFile && !loading && (
          <TouchableOpacity style={styles.changeFileButton} onPress={handlePickDocument}>
            <Text style={styles.changeFileText}>Exchange file</Text>
          </TouchableOpacity>
        )}

        {/* submit button */}
        <TouchableOpacity
          style={[styles.submitButton, (!selectedFile || loading) && styles.submitButtonDisabled]}
          onPress={handleUploadBEO}
          disabled={!selectedFile || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Process and Save Events</Text>
          )}
        </TouchableOpacity>

        <BEOImportSuccessModal
            visible={modalVisible}
            data={importResponse}
            onClose={handleCloseModalAndGoHome}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backIcon: {
    fontSize: 28,
    color: '#1A0D3F',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A0D3F',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#7E8B9B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  uploadBox: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  uploadBoxSuccess: {
    borderColor: '#2ECC71',
    backgroundColor: '#E8F8F0',
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  uploadTextContainer: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#382109',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#95A5A6',
  },
  fileInfo: {
    alignItems: 'center',
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  changeFileButton: {
    alignSelf: 'center',
    marginTop: 12,
    padding: 8,
  },
  changeFileText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#382109',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#382109',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});