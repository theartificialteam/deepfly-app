import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  IconButton,
  Chip,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

export default function UploadScreen({ navigation }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  const setCurrentAnalysis = useAppStore((state) => state.setCurrentAnalysis);

  const getFileInfo = async (uri, asset) => {
    try {
      const fileName = uri.split('/').pop();
      // Use asset info if available (from ImagePicker)
      const fileSize = asset?.fileSize || 0;
      const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
      return {
        name: fileName,
        size: fileSize > 0 ? `${sizeInMB} MB` : 'Unknown',
        sizeBytes: fileSize,
        uri: uri,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return {
        name: 'Unknown',
        size: 'Unknown',
        uri: uri,
      };
    }
  };

  const generateVideoThumbnail = async (videoUri) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000, // 1 second into the video
        quality: 0.7,
      });
      return uri;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const info = await getFileInfo(asset.uri, asset);
        
        setSelectedFile(asset.uri);
        setFileType('image');
        setFileInfo(info);
        setThumbnail(asset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
        videoMaxDuration: 60, // Max 60 seconds for performance
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const info = await getFileInfo(asset.uri, asset);
        const thumbUri = await generateVideoThumbnail(asset.uri);
        
        setSelectedFile(asset.uri);
        setFileType('video');
        setFileInfo(info);
        setThumbnail(thumbUri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your camera.');
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const info = await getFileInfo(asset.uri, asset);
        
        setSelectedFile(asset.uri);
        setFileType('image');
        setFileInfo(info);
        setThumbnail(asset.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setFileType(null);
    setFileInfo(null);
    setThumbnail(null);
  };

  const startAnalysis = () => {
    if (!selectedFile || !fileType) {
      Alert.alert('No File Selected', 'Please select an image or video first.');
      return;
    }

    // Store in Zustand
    setCurrentAnalysis({
      file: selectedFile,
      fileType: fileType,
      fileInfo: fileInfo,
      startedAt: Date.now(),
    });

    // Navigate to analysis screen
    navigation.navigate('Analysis', {
      file: selectedFile,
      fileType: fileType,
      fileInfo: fileInfo,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Upload Options */}
      {!selectedFile && (
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Choose Media Source</Text>
          
          <View style={styles.optionsGrid}>
            <Surface style={styles.optionCard} elevation={2}>
              <IconButton
                icon="image"
                size={40}
                iconColor="#FF6B6B"
                style={styles.optionIcon}
                onPress={pickImage}
                loading={loading}
              />
              <Text style={styles.optionTitle}>Gallery Image</Text>
              <Text style={styles.optionDescription}>
                Select a photo from your library
              </Text>
              <Button
                mode="outlined"
                onPress={pickImage}
                style={styles.optionButton}
                textColor="#FF6B6B"
                loading={loading}
              >
                Browse
              </Button>
            </Surface>

            <Surface style={styles.optionCard} elevation={2}>
              <IconButton
                icon="video"
                size={40}
                iconColor="#FF6B6B"
                style={styles.optionIcon}
                onPress={pickVideo}
                loading={loading}
              />
              <Text style={styles.optionTitle}>Gallery Video</Text>
              <Text style={styles.optionDescription}>
                Select a video (max 60s)
              </Text>
              <Button
                mode="outlined"
                onPress={pickVideo}
                style={styles.optionButton}
                textColor="#FF6B6B"
                loading={loading}
              >
                Browse
              </Button>
            </Surface>
          </View>

          <Surface style={styles.cameraCard} elevation={2}>
            <View style={styles.cameraContent}>
              <MaterialCommunityIcons
                name="camera"
                size={32}
                color="#FF6B6B"
              />
              <View style={styles.cameraTextContainer}>
                <Text style={styles.optionTitle}>Take New Photo</Text>
                <Text style={styles.optionDescription}>
                  Capture a photo with your camera
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={takePhoto}
                style={styles.cameraButton}
                loading={loading}
              >
                Capture
              </Button>
            </View>
          </Surface>
        </View>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <Text style={styles.sectionTitle}>Selected Media</Text>
            <IconButton
              icon="close-circle"
              size={24}
              iconColor="#808080"
              onPress={clearSelection}
            />
          </View>

          <Surface style={styles.previewCard} elevation={3}>
            {/* Thumbnail/Preview */}
            <View style={styles.thumbnailContainer}>
              {thumbnail && (
                <Image
                  source={{ uri: thumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              )}
              {fileType === 'video' && (
                <View style={styles.videoOverlay}>
                  <MaterialCommunityIcons
                    name="play-circle"
                    size={48}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </View>

            {/* File Type Badge */}
            <View style={styles.fileTypeBadge}>
              <Chip
                icon={fileType === 'video' ? 'video' : 'image'}
                style={styles.typeChip}
                textStyle={styles.typeChipText}
              >
                {fileType === 'video' ? 'Video' : 'Image'}
              </Chip>
            </View>

            {/* File Info */}
            {fileInfo && (
              <View style={styles.fileInfoContainer}>
                <View style={styles.fileInfoRow}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={18}
                    color="#808080"
                  />
                  <Text style={styles.fileInfoLabel}>File Name</Text>
                </View>
                <Text style={styles.fileInfoValue} numberOfLines={1}>
                  {fileInfo.name}
                </Text>

                <View style={[styles.fileInfoRow, { marginTop: 12 }]}>
                  <MaterialCommunityIcons
                    name="harddisk"
                    size={18}
                    color="#808080"
                  />
                  <Text style={styles.fileInfoLabel}>File Size</Text>
                </View>
                <Text style={styles.fileInfoValue}>{fileInfo.size}</Text>
              </View>
            )}
          </Surface>

          {/* Analysis Info */}
          <Surface style={styles.infoCard} elevation={1}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color="#FF6B6B"
            />
            <Text style={styles.infoText}>
              Analysis will use 4 AI models to detect potential deepfake 
              manipulation. All processing happens locally on your device.
            </Text>
          </Surface>

          {/* Analyze Button */}
          <Button
            mode="contained"
            onPress={startAnalysis}
            style={styles.analyzeButton}
            contentStyle={styles.analyzeButtonContent}
            labelStyle={styles.analyzeButtonLabel}
            icon="magnify-scan"
          >
            Analyze for Deepfakes
          </Button>
        </View>
      )}

      {/* Tips Section */}
      <Surface style={styles.tipsCard} elevation={1}>
        <Text style={styles.tipsTitle}>💡 Tips for Best Results</Text>
        <View style={styles.tipRow}>
          <MaterialCommunityIcons name="check" size={16} color="#10B981" />
          <Text style={styles.tipText}>Use clear, well-lit images</Text>
        </View>
        <View style={styles.tipRow}>
          <MaterialCommunityIcons name="check" size={16} color="#10B981" />
          <Text style={styles.tipText}>Face should be clearly visible</Text>
        </View>
        <View style={styles.tipRow}>
          <MaterialCommunityIcons name="check" size={16} color="#10B981" />
          <Text style={styles.tipText}>Higher resolution = better accuracy</Text>
        </View>
        <View style={styles.tipRow}>
          <MaterialCommunityIcons name="check" size={16} color="#10B981" />
          <Text style={styles.tipText}>Videos under 60 seconds work best</Text>
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  uploadSection: {
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionCard: {
    width: (width - 44) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  optionIcon: {
    backgroundColor: '#FF6B6B15',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: '#808080',
    textAlign: 'center',
    marginBottom: 12,
  },
  optionButton: {
    borderColor: '#FF6B6B',
    borderRadius: 8,
  },
  cameraCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252525',
  },
  cameraContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cameraButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  previewCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252525',
  },
  thumbnailContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#0D0D0D',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  fileTypeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  typeChip: {
    backgroundColor: '#FF6B6B',
  },
  typeChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  fileInfoContainer: {
    padding: 16,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fileInfoLabel: {
    fontSize: 12,
    color: '#808080',
    marginLeft: 8,
  },
  fileInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 26,
  },
  infoCard: {
    backgroundColor: '#FF6B6B10',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF6B6B30',
  },
  infoText: {
    fontSize: 13,
    color: '#A0A0A0',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  analyzeButton: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
  },
  analyzeButtonContent: {
    height: 56,
  },
  analyzeButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#252525',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#808080',
    marginLeft: 8,
  },
});

