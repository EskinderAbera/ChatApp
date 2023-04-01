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

      const rooms = response?.data?.getUser?.ChatRooms?.items || [];
      const sortedRooms = rooms.sort(
        (room1, room2) =>
          new Date(room2.chatRoom.updatedAt) -
          new Date(room1.chatRoom.updatedAt)
      );

      setchatRooms(sortedRooms);
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
