import { FlatList, Pressable, Text } from "react-native";
import React from "react";
import ContactListItem from "../components/ContactListItem";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { listUsers } from "../graphql/queries";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { createChatRoom, createUserChatRoom } from "../graphql/mutations";
import chatRoomService from "../services/chatRoomService";

const ContactsScreen = () => {
  const [users, setUsers] = React.useState([]);

  const navigation = useNavigation();

  React.useEffect(() => {
    API.graphql(graphqlOperation(listUsers)).then((result) => {
      setUsers(result.data?.listUsers?.items);
    });
  }, []);

  const createChatRoomWithUser = async (user) => {
    // Check if we already have a ChatRoom with user
    const existingChatRoom = await chatRoomService(user.id);

    if (existingChatRoom) {
      navigation.navigate("Chat", { id: existingChatRoom.chatRoom.id });

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
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <ContactListItem
          user={item}
          onPress={() => createChatRoomWithUser(item)}
        />
      )}
      style={{ backgroundColor: "white" }}
      ListHeaderComponent={() => (
        <Pressable
          onPress={() => navigation.navigate("New Group")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            paddingHorizontal: 20,
          }}
        >
          <MaterialIcons
            name="group"
            size={24}
            color="royalblue"
            style={{
              marginRight: 20,
              backgroundColor: "gainsboro",
              padding: 7,
              borderRadius: 20,
              overflow: "hidden",
            }}
          />
          <Text style={{ color: "royalblue", fontSize: 16 }}>New Group</Text>
        </Pressable>
      )}
    />
  );
};

export default ContactsScreen;
