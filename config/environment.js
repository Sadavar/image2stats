var environments = {
    staging: {
      FIREBASE_API_KEY: "AIzaSyA0y5MNLzQCBC7yTC7DJKGgitaYaXuuCf0",
      FIREBASE_AUTH_DOMAIN: "image2stats.firebaseapp.com",
      FIREBASE_DATABASE_URL: "https://image2stats.firebaseio.com/",
      FIREBASE_PROJECT_ID: "image2stats",
      FIREBASE_STORAGE_BUCKET: "image2stats.appspot.com",
      FIREBASE_MESSAGING_SENDER_ID: "460131654044",
      GOOGLE_CLOUD_VISION_API_KEY: "AIzaSyBsPxyiqBo5wUvYJSP4gC4wbvuNFJGyNmA",
      TRN_API_KEY: "0fc1d45b-5a7b-4e9e-b408-1579edf6bbc4"
    },
    production: {
      // Warning: This file still gets included in your native binary and is not a secure way to store secrets if you build for the app stores. Details: https://github.com/expo/expo/issues/83
    }
  };
  function getReleaseChannel() {
    let releaseChannel = Expo.Constants.manifest.releaseChannel;
    if (releaseChannel === undefined) {
      return "staging";
    } else if (releaseChannel === "staging") {
      return "staging";
    } else {
      return "staging";
    }
  }
  function getEnvironment(env) {
    console.log("Release Channel: ", getReleaseChannel());
    return environments[env];
  }
  var Environment = getEnvironment(getReleaseChannel());
  export default Environment;