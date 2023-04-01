import { StyleSheet, TextInput } from "react-native";
import React from "react";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { createMessage, updateChatRoom } from "../../graphql/mutations";

const InputBox = ({ chatRoom }) => {
  const [newMessage, setNewMessage] = React.useState("");

  const onSend = async () => {
    const authUser = await Auth.currentAuthenticatedUser();

    const message = {
      chatroomID: chatRoom.id,
      text: newMessage,
      userID: authUser.attributes.sub,
    };

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

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <AntDesign name="plus" size={24} color="royalblue" />
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
});

export default InputBox;
