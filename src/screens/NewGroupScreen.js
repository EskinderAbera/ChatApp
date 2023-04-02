import React, { useState, useEffect } from "react";
import { FlatList, View, TextInput, StyleSheet, Button } from "react-native";
import ContactListItem from "../components/ContactListItem";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { listUsers } from "../graphql/queries";
import { createUserChatRoom, createChatRoom } from "../graphql/mutations";
import { useNavigation } from "@react-navigation/native";

const NewGroupScreen = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = React.useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    API.graphql(graphqlOperation(listUsers)).then((result) => {
      setUsers(result.data?.listUsers?.items);
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="Create"
          disabled={!name || selectedUserIds.length < 1}
          onPress={onCreateGroupPress}
        />
      ),
    });
  }, [name, selectedUserIds]);

  const onCreateGroupPress = async () => {
    // create new chatRoom
    const newChatRoomData = await API.graphql(
      graphqlOperation(createChatRoom, { input: {} })
    );

    if (!newChatRoomData.data?.createChatRoom) {
      console.log("Error creating the chat Error");
    }
    const newChatRoom = newChatRoomData.data?.createChatRoom;

    // add the selected users to the chatroom

    await Promise.all(
      selectedUserIds.map((userId, index) =>
        API.graphql(
          graphqlOperation(createUserChatRoom, {
            input: { chatRoomId: newChatRoom.id, userId },
          })
        )
      )
    );

    // add the auth user to the chatroom
    const authUser = await Auth.currentAuthenticatedUser();

    await API.graphql(
      graphqlOperation(createUserChatRoom, {
        input: { chatRoomId: newChatRoom.id, userId: authUser.attributes.sub },
      })
    );

    setSelectedUserIds([]);
    setName("");
    // navigate to the newly created ChatRoom
    navigation.navigate("Chat", { id: newChatRoom.id });
  };

  const onCantactPress = (id) => {
    setSelectedUserIds((userIds) => {
      if (userIds.includes(id)) {
        // remove id from selected
        return [...userIds].filter((uid) => uid !== id);
      } else {
        // add selected id
        return [...userIds, id];
      }
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Group name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <ContactListItem
            user={item}
            selectable
            onPress={() => onCantactPress(item.id)}
            isSelected={selectedUserIds.includes(item.id)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "white" },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "lightgray",
    padding: 10,
    margin: 10,
  },
});

export default NewGroupScreen;
