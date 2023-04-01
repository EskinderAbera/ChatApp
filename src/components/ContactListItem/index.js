import { Text, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigation } from "@react-navigation/native";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { createChatRoom, createUserChatRoom } from "../../graphql/mutations";
import chatRoomService from "../../services/chatRoomService";

dayjs.extend(relativeTime);

const ContactListItem = ({ user }) => {
  const navigation = useNavigation();
  const onPress = async () => {
    // Check if we already have a ChatRoom with user
    const existingChatRoom = await chatRoomService(user.id);

    if (existingChatRoom) {
      navigation.navigate("Chat", { id: existingChatRoom.id });

      return;
    }
    // create new chatRoom

    const newChatRoomData = await API.graphql(
      graphqlOperation(createChatRoom, { input: {} })
    );

    if (!newChatRoomData.data?.createChatRoom) {
      console.log("Error creating the chat Error");
    }
    const newChatRoom = newChatRoomData.data?.createChatRoom;

    // add the clicked user to the chatroom
    await API.graphql(
      graphqlOperation(createUserChatRoom, {
        input: { chatRoomId: newChatRoom.id, userId: user.id },
      })
    );
    // add the auth user to the chatroom
    const authUser = await Auth.currentAuthenticatedUser();

    await API.graphql(
      graphqlOperation(createUserChatRoom, {
        input: { chatRoomId: newChatRoom.id, userId: authUser.attributes.sub },
      })
    );
    // navigate to the newly created ChatRoom

    navigation.navigate("Chat", { id: newChatRoom.id });
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image source={{ uri: user.image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.subTitle} numberOfLines={2}>
          {user.status}
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
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
  },
  subTitle: {
    color: "gray",
  },
});

export default ContactListItem;
