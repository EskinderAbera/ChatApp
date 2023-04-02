import { API, graphqlOperation, Auth } from "aws-amplify";

const chatRoomService = async (user1ID) => {
  const authUser = await Auth.currentAuthenticatedUser();

  // get all chat room of user 1
  const response = await API.graphql(
    graphqlOperation(listChatRooms, { id: authUser.attributes.sub })
  );

  const chatRooms = response.data?.getUser?.ChatRooms?.items || [];

  const chatRoom = chatRooms.find((chatRoomItem) => {
    return (
      chatRoomItem.chatRoom.users.items.length &&
      chatRoomItem.chatRoom.users.items.some(
        (userItem) => userItem.user.id === user1ID
      )
    );
  });

  return chatRoom;
  // get all chat rooms of user2

  // remove chat rooms with more than 2 users

  // get the common chat rooms
};

export default chatRoomService;

export const listChatRooms = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      ChatRooms {
        items {
          chatRoom {
            id
            users {
              items {
                user {
                  name
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;
