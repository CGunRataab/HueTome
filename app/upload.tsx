import { useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import gql from 'graphql-tag';
import { useContext, useEffect, useState } from 'react';
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { uploadToFirebase } from '@/components/firebase';
import { CreateUserContext } from '@/context/userContext';
import { EnterArrow } from '@/assets/images/enterArrow';

const UPLOAD_PIC = gql`
  mutation Mutation($input: PictureCreateInput!) {
    createPicture(input: $input) {
      id
    }
  }
`;

export default function Upload(): React.ReactNode {
  const context = useContext(CreateUserContext);
  const [temp, setTemp] = useState<string>('');
  const [temp2, setTemp2] = useState<{ photo: { uri: string; fileName: string } } | null>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const [sendImage] = useMutation(UPLOAD_PIC);
  useEffect(() => {
    AsyncStorage.getItem('upload').then((e) => {
      if (e !== null) {
        setTemp(e);
      }
    });
    AsyncStorage.removeItem('upload');
  }, []);
  const Parser = async (): Promise<void> => {
    const tes = await JSON.parse(temp);
    setTemp2(tes);
  };
  useEffect(() => {
    Parser();
  }, [temp]);
  const Upload = async (): Promise<void> => {
    try {
      if (!title) {
        setErrorMessage('Needs a title');
        return;
      }
      const fileName = temp2?.photo.uri.split('/').pop();
      const uploadRes = await uploadToFirebase(temp2?.photo.uri, fileName);
      await axios
        .get('https://api.sightengine.com/1.0/check.json', {
          params: {
            url: uploadRes.downloadUrl,
            models: 'properties',
            api_user: process.env.EXPO_PUBLIC_COLOR_API_USER,
            api_secret: process.env.EXPO_PUBLIC_COLOR_API_SECRET,
          },
        })
        .then((res) => {
          sendImage({
            variables: {
              input: {
                photo: uploadRes.downloadUrl,
                title,
                description,
                color: res.data.colors.dominant,
                userId: context?.user?.id,
                username: context?.user?.name,
              },
            },
          }).catch((err) => console.log(err.message));
        })
        .catch((err) => console.log(err));
      router.push('/(tabs)/(home)');
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, alignItems: 'center', gap: 10 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            borderColor: '#00EEEE',
            borderWidth: 2,
            width: 50,
            height: 50,
            borderRadius: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ rotate: '180deg' }],
          }}>
          <EnterArrow width="40px" height="40px" color="#00EEEE" />
        </TouchableOpacity>
        <Image
          style={{ width: '100%', height: 500, borderWidth: 2, borderColor: 'black' }}
          source={temp2?.photo?.uri}
          contentFit="cover"
          transition={1000}
        />
        <View style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          <TextInput
            style={{
              width: '90%',
              height: 40,
              borderColor: 'black',
              borderRadius: 10,
              borderWidth: 1,
              fontSize: 20,
              paddingLeft: 15,
            }}
            placeholderTextColor="grey"
            onChangeText={(e) => setTitle(e)}
            placeholder="Title"
          />
          {errorMessage !== null ? (
            <Text style={{ color: 'red', fontWeight: '500', fontSize: 15 }}>{errorMessage}</Text>
          ) : (
            <></>
          )}
        </View>
        <TextInput
          style={{
            width: '90%',
            height: 70,
            borderColor: 'black',
            borderRadius: 10,
            borderWidth: 1,
            fontSize: 20,
            paddingLeft: 15,
          }}
          placeholderTextColor="grey"
          onChangeText={(e) => setDescription(e)}
          placeholder="Description"
        />
        <TouchableOpacity
          onPress={() => {
            Upload();
          }}
          style={{
            borderWidth: 1,
            borderColor: 'black',
            borderRadius: 5,
            width: 100,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0d5',
          }}>
          <Text style={{ fontSize: 20, color: 'white' }}>Upload</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
