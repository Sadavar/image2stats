import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  ScrollView,
  View
} from "react-native";
import * as Constants from 'expo-constants'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import uuid from "uuid";
import Environment from "../config/environment";
import firebase from "../utils/firebase";

import { AppLoading } from 'expo';
import { Container, Header, Content, Card, CardItem, Body, Text, Button, H1, H2, H3, } from 'native-base';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

console.disableYellowBox = true;

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      image: null,
      uploading: false,
      googleResponse: [],
      trnResponse: [],
      epicUserHandle: " ",
      epicKD: " ",
      epicWins: " ",
      URL: " ",
      statsReady: false
    };
  }

  async componentDidMount() {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
  }

  render() {
    let { image } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >

          <Text style={styles.getStartedText}>Image2Stats</Text>

          <Container style={styles.buttonCard}>
            <Content>

              <Card style={styles.buttonCard2}>
                <CardItem >
                  <Body>
                    <Button bordered style={styles.buttonItems} onPress={() => this._pickImage()}>
                      <Text>         Pick an image         </Text>
                    </Button>
                  </Body>
                </CardItem>
                <CardItem >
                  <Body>
                    <Button bordered style={styles.buttonItems} onPress={() => this._takePhoto()}>
                      <Text>          Take a photo          </Text>
                    </Button>
                  </Body>
                </CardItem>
                {this._maybeRenderImage()}
                {this._maybeRenderUploadingOverlay()}
              </Card>

              {this.state.statsReady && (
                this.printStats()
              )}

            </Content>
          </Container>
        </ScrollView>
      </View>
    );
  }

  printStats = () => {
    return (
      <Card>
        <CardItem>
          <Body>
            <View>
              <Text>
                <Text style={{fontWeight: "bold", fontSize: 27}}>Name: </Text>
                <Text style={{fontSize: 27}}>{this.state.epicUserHandle}</Text>
              </Text>
            </View>
          </Body>
        </CardItem>

        <CardItem>
          <Body>
          <View>
              <Text>
                <Text style={{fontWeight: "bold", fontSize: 27}}>KD: </Text>
                <Text style={{fontSize: 27}}>{this.state.epicKD}</Text>
              </Text>
            </View>
          </Body>
        </CardItem>

        <CardItem>
          <Body>
          <View>
              <Text>
                <Text style={{fontWeight: "bold", fontSize: 27}}>Wins: </Text>
                <Text style={{fontSize: 27}}>{this.state.epicWins}</Text>
              </Text>
            </View>
          </Body>
        </CardItem>

      </Card>

    );

  };


  organize = array => {
    return array.map(function (item, i) {
      return (
        <View key={i}>
          <Text>{item}</Text>
        </View>
      );
    });
  };


  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center"
            }
          ]}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let { image, googleResponse } = this.state;
    if (!image) {
      return;
    }

    return (

      <CardItem style={styles.imageRenderMain}>
        <Body>
          <View style={{ paddingBottom: 20, alignSelf: "center" }}>
            <Button rounded style={styles.analyzeButton} onPress={() => this.submitToGoogle()}>
              <Text>Get Stats</Text>
            </Button>
          </View>

          <Image source={{ uri: image }} style={{ width: 250, height: 250, alignSelf: "center" }} />

        </Body>
      </CardItem>
    );
  };


  _takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    this._handleImagePicked(pickerResult);
  };

  _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async pickerResult => {
    try {
      this.setState({ uploading: true });

      if (!pickerResult.cancelled) {
        uploadUrl = await uploadImageAsync(pickerResult.uri);
        this.setState({ image: uploadUrl });
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      this.setState({ uploading: false });
    }
  };


  submitToTRN = async () => {
    this.setState({ URL: "https://api.fortnitetracker.com/v1/profile/pc/" + global.analyzedText }, () =>
      console.log(this.state.URL)
    );

    try {
      let response = await fetch(
        this.state.URL,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            'TRN-Api-Key': Environment["TRN_API_KEY"],
          },
          method: "GET",
        }
      );
      let aresponseJson = await response.json();

      this.setState({ trnResponse: aresponseJson }, () =>
        console.log(JSON.stringify(this.state.trnResponse))
      );
    } catch (error) {
      console.log(error);
    }

    this.setState({
      epicUserHandle: this.state.trnResponse.epicUserHandle,
      epicKD: this.state.trnResponse.stats.p2.kd.value,
      epicWins: this.state.trnResponse.lifeTimeStats[8].value,

    }, () =>
        console.log(this.state.epicUserHandle) + console.log(this.state.epicKD)
    );

    this.setState({ statsReady: true }, () =>
      console.log(this.state.statsReady)
    );

  };


  submitToGoogle = async () => {
    try {
      this.setState({ uploading: true });
      let { image } = this.state;
      let body = JSON.stringify({
        requests: [
          {
            features: [
              // { type: "LABEL_DETECTION", maxResults: 10 },
              // { type: "LANDMARK_DETECTION", maxResults: 5 },
              // { type: "FACE_DETECTION", maxResults: 5 },
              // { type: "LOGO_DETECTION", maxResults: 5 },
              { type: "TEXT_DETECTION", maxResults: 700 }
              // { type: "DOCUMENT_TEXT_DETECTION", maxResults: 5 },
              // { type: "SAFE_SEARCH_DETECTION", maxResults: 5 },
              // { type: "IMAGE_PROPERTIES", maxResults: 5 },
              // { type: "OBJECT_LOCALIZATION", maxResults: 50 }
              // { type: "WEB_DETECTION", maxResults: 5 }
            ],
            image: {
              source: {
                imageUri: image
              }
            }
          }
        ]
      });
      let response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=" +
        Environment["GOOGLE_CLOUD_VISION_API_KEY"],
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: body
        }
      );
      let responseJson = await response.json();

      this.setState({ googleResponse: responseJson, uploading: false }, () =>
        console.log(JSON.stringify(this.state.googleResponse))
      );

      // this.setState = ({
      //   googleResponse: responseJson,
      //   uploading: false

      // });
      // console.log(this.state.googleResponse);

      global.analyzedText = this.state.googleResponse.responses[0].textAnnotations[3].description;
      this.submitToTRN();


    } catch (error) {
      console.log(error);
    }
  };
}

async function uploadImageAsync(uri) {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const ref = firebase
    .storage()
    .ref()
    .child(uuid.v4());
  const snapshot = await ref.put(blob);

  // We're done with the blob, close and release it
  blob.close();

  return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white"
  },

  contentContainer: {
    paddingTop: 10
  },

  getStartedText: {
    fontSize: 40,
    color: "black",
    lineHeight: 24,
    textAlign: "center",
    fontFamily: 'System',
    paddingTop: 40,
    fontWeight: "bold"
  },

  buttonCard: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 0
  },

  buttonCard2: {
    paddingTop: 10,
  },


  buttonItems: {
    alignSelf: "center",
  },

  imageRenderMain: {
    alignSelf: "center",

  },

  analyzeButton: {
    alignSelf: "center",
  }
});