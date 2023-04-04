import { StyleSheet, TextInput, View, Image } from "react-native";
import React from "react";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { API, Auth, graphqlOperation, Storage } from "aws-amplify";
import { createMessage, updateChatRoom } from "../../graphql/mutations";
import * as ImagePicker from "expo-image-picker";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const InputBox = ({ chatRoom }) => {
  const [newMessage, setNewMessage] = React.useState("");
  const [image, setImage] = React.useState("");

  const onSend = async () => {
    const authUser = await Auth.currentAuthenticatedUser();

    const message = {
      chatroomID: chatRoom.id,
      text: newMessage,
      userID: authUser.attributes.sub,
    };

    if (image) {
      message.images = [await uploadFile(image)];
      setImage(null);
    }

    const newMessageData = await API.graphql(
      graphqlOperation(createMessage, { input: message })
    );

    setNewMessage("");

    await API.graphql(
      graphqlOperation(updateChatRoom, {
        input: {
          _version: chatRoom._version,
          chatRoomLastMessageId: newMessageData.data.createMessage.id,
          id: chatRoom.id,
        },
      })
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadFile = async (fileUri) => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const key = `${uuidv4()}.jpg`;
      await Storage.put(key, blob, {
        contentType: "image/jpg", // contentType is optional
      });
      return key;
    } catch (err) {
      console.log("Error uploading file:", err);
    }
  };

  return (
    <>
      {image && (
        <View style={styles.attachmentContainer}>
          <Image
            source={{ uri: image }}
            style={styles.selectedImage}
            resizeMode="contain"
          />
          <MaterialIcons
            name="highlight-remove"
            onPress={() => setImage(null)}
            size={20}
            color="gray"
            style={styles.removeSelectedImage}
          />
        </View>
      )}
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <AntDesign
          name="plus"
          size={24}
          color="royalblue"
          onPress={pickImage}
        />
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="type your message"
          style={styles.input}
        />
        <MaterialIcons
          name="send"
          size={24}
          color="white"
          style={styles.send}
          onPress={onSend}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "whitesmoke",
    padding: 5,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 50,
    borderColor: "lightgray",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    fontSize: 16,
  },
  send: {
    backgroundColor: "royalblue",
    padding: 7,
    borderRadius: 15,
    overflow: "hidden",
  },
  selectedImage: {
    width: 200,
    height: 100,
    margin: 5,
  },
  attachmentContainer: {
    alignItems: "flex-end",
  },
  removeSelectedImage: {
    position: "absolute",
    right: 10,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
});

export default InputBox;
