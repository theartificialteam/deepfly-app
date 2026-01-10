import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { Text, Button, Surface, IconButton, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function UploadScreen({ navigation }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(null); // 'gallery', 'camera', or null

  const setCurrentAnalysis = useAppStore((state) => state.setCurrentAnalysis);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [selectedFile]);

  const handleMediaPick = async (source) => {
    const isCamera = source === 'camera';
    setLoading(source);
    try {
      const permissionFn = isCamera ? ImagePicker.requestCameraPermissionsAsync : ImagePicker.requestMediaLibraryPermissionsAsync;
      const permissionResult = await permissionFn();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', `Please allow access to your ${isCamera ? 'camera' : 'photo library'}.`);
        setLoading(null);
        return;
      }
      
      const launchFn = isCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const result = await launchFn({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const thumbUri = asset.type === 'video' ? (await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 1000 })).uri : asset.uri;
        
        setSelectedFile({
          uri: asset.uri,
          type: asset.type,
          name: asset.uri.split('/').pop(),
          size: asset.fileSize ? formatBytes(asset.fileSize) : 'Unknown',
          thumbnail: thumbUri,
        });
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isCamera ? 'take photo' : 'pick media'}.`);
    } finally {
      setLoading(null);
    }
  };

  const startAnalysis = () => {
    if (!selectedFile) return;
    setCurrentAnalysis({
      file: selectedFile.uri,
      fileType: selectedFile.type,
      fileInfo: { name: selectedFile.name, size: selectedFile.size },
    });
    navigation.navigate('Analysis', {
      file: selectedFile.uri,
      fileType: selectedFile.type,
      fileInfo: { name: selectedFile.name, size: selectedFile.size },
    });
  };

  const renderSelection = () => (
    <View style={styles.selectionContainer}>
      <Text style={styles.title}>Select Media</Text>
      <Text style={styles.subtitle}>Choose an image or video to analyze for AI manipulation.</Text>
      
      <TouchableOpacity style={styles.optionButton} onPress={() => handleMediaPick('gallery')} disabled={!!loading}>
        <Surface style={styles.optionSurface} elevation={3}>
          {loading === 'gallery' ? <ActivityIndicator color="#A78BFA" /> : <MaterialCommunityIcons name="image-multiple-outline" size={32} color="#A78BFA" />}
          <Text style={styles.optionTitle}>Choose from Gallery</Text>
          <Text style={styles.optionDescription}>Select a photo or video</Text>
        </Surface>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.optionButton} onPress={() => handleMediaPick('camera')} disabled={!!loading}>
        <Surface style={styles.optionSurface} elevation={3}>
          {loading === 'camera' ? <ActivityIndicator color="#A78BFA" /> : <MaterialCommunityIcons name="camera-outline" size={32} color="#A78BFA" />}
          <Text style={styles.optionTitle}>Use Camera</Text>
          <Text style={styles.optionDescription}>Take a new photo</Text>
        </Surface>
      </TouchableOpacity>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.title}>Confirm Selection</Text>
      <Surface style={styles.previewCard} elevation={4}>
        <Image source={{ uri: selectedFile.thumbnail }} style={styles.thumbnail} />
        {selectedFile.type === 'video' && (
          <View style={styles.videoOverlay}>
            <MaterialCommunityIcons name="play-circle-outline" size={60} color="rgba(255,255,255,0.8)" />
          </View>
        )}
        <IconButton icon="close-circle" style={styles.clearButton} iconColor="rgba(0,0,0,0.6)" size={30} onPress={() => setSelectedFile(null)} />
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
          <Text style={styles.fileSize}>{selectedFile.type.charAt(0).toUpperCase() + selectedFile.type.slice(1)} • {selectedFile.size}</Text>
        </View>
      </Surface>
      <Button
        mode="contained"
        onPress={startAnalysis}
        style={styles.analyzeButton}
        contentStyle={styles.analyzeButtonContent}
        labelStyle={styles.analyzeButtonLabel}
        icon="magnify-scan"
      >
        Analyze Now
      </Button>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {selectedFile ? renderPreview() : renderSelection()}
      
      {/* Tips Section */}
      <Surface style={styles.tipsCard} elevation={1}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#FFD700" />
            <Text style={styles.tipsTitle}>Tips for Best Results</Text>
        </View>
        <Text style={styles.tipText}>• Use clear, well-lit images or videos.</Text>
        <Text style={styles.tipText}>• Faces should be clearly visible.</Text>
        <Text style={styles.tipText}>• Videos under 60 seconds work best.</Text>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'space-between',
    padding: 20,
  },
  selectionContainer: {
      flex: 1,
      justifyContent: 'center',
  },
  previewContainer: {
      flex: 1,
      justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionButton: {
    borderRadius: 20,
    marginBottom: 20,
  },
  optionSurface: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: '#808080',
    marginTop: 4,
  },
  previewCard: {
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#252525',
  },
  thumbnail: {
    width: '100%',
    height: 250,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#000',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  fileInfo: {
    padding: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fileSize: {
    fontSize: 14,
    color: '#808080',
    marginTop: 4,
  },
  analyzeButton: {
    borderRadius: 16,
    backgroundColor: '#A78BFA',
  },
  analyzeButtonContent: {
    height: 60,
  },
  analyzeButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252525',
    marginTop: 20
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#A0A0A0',
    lineHeight: 20,
  },
});
