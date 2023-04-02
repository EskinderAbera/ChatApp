import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet, Button } from "react-native";
import ContactListItem from "../components/ContactListItem";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { listUsers } from "../graphql/queries";
import { createUserChatRoom } from "../graphql/mutations";
import { useNavigation, useRoute } from "@react-navigation/native";

const AddContactsGroupScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = React.useState([]);

  const navigation = useNavigation();
  const route = useRoute();

  const chatRoom = route.params.chatRoom;

  useEffect(() => {
    API.graphql(graphqlOperation(listUsers)).then((result) => {
      setUsers(
        result.data?.listUsers?.items.filter(
          (item) =>
            !chatRoom.users.items.some(
              (chatRoomUser) =>
                !chatRoomUser._deleted && item.id === chatRoomUser.userId
            )
        )
      );
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="Add to Group"
          disabled={selectedUserIds.length < 1}
          onPress={onAddToGroupPress}
        />
      ),
    });
  }, [selectedUserIds]);

  const onAddToGroupPress = async () => {
    await Promise.all(
      selectedUserIds.map((userId, index) =>
        API.graphql(
          graphqlOperation(createUserChatRoom, {
            input: { chatRoomId: chatRoom.id, userId },
          })
        )
      )
    );

    setSelectedUserIds([]);

    // navigate to the newly created ChatRoom
    navigation.goBack();
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

export default AddContactsGroupScreen;
