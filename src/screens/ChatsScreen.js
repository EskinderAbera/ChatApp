import { View, Text, FlatList } from "react-native";
import React from "react";
import chats from "../../assets/data/chats.json";
import ChatListItem from "../components/ChatListItem";

const ChatsScreen = () => {
  return (
    <FlatList
      data={chats}
      renderItem={({ item }) => <ChatListItem chat={item} />}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: "white" }}
    />
  );
};

export default ChatsScreen;
