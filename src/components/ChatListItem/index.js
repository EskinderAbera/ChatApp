import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigation } from "@react-navigation/native";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { onUpdateChatRoom } from "../../graphql/subscriptions";

dayjs.extend(relativeTime);

const ChatListItem = ({ chat, id }) => {
  const navigation = useNavigation();
  const [user, setUser] = React.useState(null);
  const [chatRoom, setchatRoom] = React.useState(chat);

  React.useEffect(() => {
    const fetchUser = async () => {
      const authUser = await Auth.currentAuthenticatedUser();

      // Loop through chat.users.items and find a user that is not us (Authenticated user)
      const userItem = chatRoom.users.items.find(
        (item) => item.user.id !== authUser.attributes.sub
      );
      setUser(userItem?.user);
    };

    fetchUser();
  }, []);

  // const user = chat.users.items.filter((user) => user.user.id != id)[0].user;

  React.useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateChatRoom, {
        filter: { id: { eq: chat.id } },
      })
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
  }, [chat.id]);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chat", { id: chatRoom.id, name: user?.name })
      }
      style={styles.container}
    >
      <Image source={{ uri: user?.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {chatRoom.name || user?.name}
          </Text>
          {chatRoom.LastMessage && (
            <Text style={styles.subTitle}>
              {dayjs(chatRoom.LastMessage?.createdAt).fromNow(true)}
            </Text>
          )}
        </View>
        <Text style={styles.subTitle} numberOfLines={2}>
          {chatRoom.LastMessage?.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginVertical: 5,
    height: 70,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  content: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "lightgray",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  name: {
    flex: 1,
    fontWeight: "bold",
  },
  subTitle: {
    color: "gray",
  },
});

export default ChatListItem;
