import { FlatList } from "react-native";
import React from "react";
// import chats from "../../../assets/data/chats.json";
import ChatListItem from "../../components/ChatListItem";
import { listChatRooms } from "./queries";
import { API, Auth, graphqlOperation } from "aws-amplify";

const ChatsScreen = () => {
  const [chatRooms, setchatRooms] = React.useState([]);
  const [authUserId, setauthUserId] = React.useState(null);

  React.useEffect(() => {
    const fetchChatRooms = async () => {
      const authUser = await Auth.currentAuthenticatedUser();
      const response = await API.graphql(
        graphqlOperation(listChatRooms, { id: authUser.attributes.sub })
      );
      setchatRooms(response.data.getUser.ChatRooms.items);
      setauthUserId(authUser.attributes.sub);
    };
    fetchChatRooms();
  }, []);
  return (
    <FlatList
      data={chatRooms}
      renderItem={({ item }) => (
        <ChatListItem chat={item.chatRoom} id={authUserId} />
      )}
      keyExtractor={(item) => item.chatRoom.id}
      style={{ backgroundColor: "white" }}
    />
  );
};

export default ChatsScreen;
