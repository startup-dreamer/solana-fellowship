import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
     import { useState, useRef } from 'react';
     import { Button, StyleSheet, Text, TouchableOpacity, View, Modal, Image } from 'react-native';
     import * as ImagePicker from 'expo-image-picker';
     import * as MediaLibrary from 'expo-media-library';
     import ChoosePicture from '@/components/ChoosePicture';
     import AntDesign from '@expo/vector-icons/AntDesign';
     import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

     export default function CameraScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
       const [facing, setFacing] = useState<CameraType>('back');
       const [permission, requestPermission] = useCameraPermissions();
       const [photoUri, setPhotoUri] = useState<string | null>(null);
       const [showChoosePicture, setShowChoosePicture] = useState(false);
       const cameraRef = useRef<CameraView>(null);

       if (!permission) {
         // Camera permissions are still loading.
         return <View />;
       }

       if (!permission.granted) {
//          Camera permissions are not granted yet.
         return (
           <View style={styles.container_permission}>
             <Text style={styles.message}>We need your permission to show the camera</Text>
             <TouchableOpacity onPress={requestPermission}>
                <Text style={styles.grant_permission}>Grant Permission</Text>
             </TouchableOpacity>
           </View>
         );
       }

       function toggleCameraFacing() {
         setFacing(current => (current === 'back' ? 'front' : 'back'));
       }

       async function takePicture() {
         if (cameraRef.current) {
           const photo = await cameraRef.current.takePictureAsync();
           if (!photo) {
             console.log('Failed to take picture');
             return;
           }
           console.log(photo);
           setPhotoUri(photo.uri);

           const { status } = await MediaLibrary.requestPermissionsAsync();
           if (status === 'granted') {
             const asset = await MediaLibrary.createAssetAsync(photo.uri);
             const album = await MediaLibrary.getAlbumAsync('Camera');
             if (album == null) {
               await MediaLibrary.createAlbumAsync('Camera', asset, false);
             } else {
               await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
             }
             console.log('Photo saved to album');
           } else {
             console.log('Permission to access media library is not granted');
           }

           // Chuyển sang component ChoosePicture
           setShowChoosePicture(true);
         }
       }

       return (
         <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.container}>
          {showChoosePicture ? (
            <ChoosePicture visible={showChoosePicture} onClose={() => setShowChoosePicture(false)} photoUri={photoUri} />
          ) : (
            <>
              <CameraView ref={cameraRef} style={styles.camera} facing={facing}/>
              <View style={styles.button_grid}>
                <TouchableOpacity onPress={toggleCameraFacing}>
                    <Text style={styles.flip_camera}>
                        <MaterialCommunityIcons name="camera-flip" size={24} color="#cabaff" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={takePicture}>
                    <Text style={styles.take_picture}>
                        <AntDesign name="camerao" size={24} color="black" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.close_button}>
                        <AntDesign name="close" size={24} color="red" />
                    </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },
  container: {
    flex: 0.9,
    justifyContent: 'center',
    backgroundColor: 'black',
    margin: 0,
    borderRadius: 12,
    padding: 10,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    fontSize:16,
    color:'white',
  },
  camera: {
    flex: 1,
    borderRadius: 8,
  },
  buttonContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    flexDirection: 'row'
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  preview: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },

  button_grid: {
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    marginTop: 10,
},
    flip_camera: {
      color:'lightblue',
      padding: 12,
      backgroundColor:'transparent',
      borderWidth:2,
      borderRadius:20,
      borderColor: '#cabaff',
      paddingTop:16,
      justifyContent:'center',
      width: 120,
      paddingLeft:47,
  },
  take_picture: {
      color:'white',
      padding: 12,
      backgroundColor:'white',
      borderWidth:2,
      borderRadius:20,
      borderColor: 'white',
      paddingTop:16,
      justifyContent:'center',
      width: 120,
      paddingLeft:47,
  },
  close_button: {
    color:'white',
    padding: 12,
    backgroundColor:'transparent',
    borderWidth:2,
    borderRadius:20,
    borderColor: 'red',
    paddingTop:16,
    justifyContent:'center',
    width: 120,
    paddingLeft:47,
  },
  container_permission:{
      backgroundColor:'black',
      height:200,
      alignItems:'center',
      justifyContent:'center',
      marginVertical:0,
      },
  grant_permission:{
    color:'white',
    fontSize:16,
    backgroundColor:'#41a65a',
    padding:14,
    borderRadius: 10,
    width:250,
    textAlign:'center'
  }
});


// const Btn = ({ title, onPress }: { title: string; onPress: () => void | Promise<void> }) => {
//   return (
//     <View style={{ marginVertical: 10 }}>
//       <Button title={title} onPress={onPress} />
//     </View>
//   );
// };
