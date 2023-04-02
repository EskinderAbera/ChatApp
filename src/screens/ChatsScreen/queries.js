export const listChatRooms = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      ChatRooms {
        items {
          _deleted
          chatRoom {
            id
            updatedAt
            name
            image
            LastMessage {
              id
              createdAt
              text
            }
            users {
              items {
                user {
                  name
                  image
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
