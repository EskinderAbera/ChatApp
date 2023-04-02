import {
  ImageBackground,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import React from "react";
import bg from "../../assets/images/BG.png";
import Message from "../components/Message";
import InputBox from "../components/InputBox";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API, graphqlOperation } from "aws-amplify";
import { getChatRoom, listMessagesByChatRoom } from "../graphql/queries";
import { onCreateMessage, onUpdateChatRoom } from "../graphql/subscriptions";

const ChatScreen = () => {
  const [chatRoom, setchatRoom] = React.useState(null);
  const [messages, setMessages] = React.useState([]);

  const navigation = useNavigation();
  const route = useRoute();

  const { id, name } = route.params;

  // fetch chatroom
  React.useEffect(() => {
    API.graphql(graphqlOperation(getChatRoom, { id })).then((result) => {
      setchatRoom(result.data?.getChatRoom);
    });

    const subscription = API.graphql(
      graphqlOperation(onUpdateChatRoom, { filter: { id: { eq: id } } })
    ).subscribe({
      next: ({ value }) => {
        setchatRoom((cr) => ({
          ...(cr || {}),
          ...value.data.onUpdateChatRoom,
        }));
      },
      error: (err) => console.log(err),
    });

    return () => subscription.unsubscribe();
  }, [id]);

  // fetch Messages
  React.useEffect(() => {
    API.graphql(
      graphqlOperation(listMessagesByChatRoom, {
        chatroomID: id,
        sortDirection: "DESC",
      })
    ).then((result) => {
      setMessages(result.data?.listMessagesByChatRoom?.items);
    });

    // Subscribe to new message
    // filter used to listen only with the same id to the chatroom

    const subscription = API.graphql(
      graphqlOperation(onCreateMessage, { filter: { chatroomID: { eq: id } } })
    ).subscribe({
      next: ({ value }) => {
        setMessages((m) => [value.data.onCreateMessage, ...m]);
      },
      error: (err) => console.log(err),
    });

    // unsubscribe when the component unmount
    return () => subscription.unsubscribe();
  }, [id]);

  React.useEffect(() => {
    navigation.setOptions({ title: name });
  }, [name]);

  if (!chatRoom) {
    return <ActivityIndicator />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.bg}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 90}
    >
      <ImageBackground source={bg} style={styles.bg}>
        <FlatList
          data={messages}
          renderItem={({ item }) => <Message message={item} />}
          style={styles.list}
          inverted
        />
        <InputBox chatRoom={chatRoom} />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  list: {
    padding: 10,
  },
});

export default ChatScreen;
