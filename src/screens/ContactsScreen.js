import { FlatList } from "react-native";
import React from "react";
import chats from "../../assets/data/chats.json";
import ContactListItem from "../components/ContactListItem";
import { API, graphqlOperation } from "aws-amplify";
import { listUsers } from "../graphql/queries";

const ContactsScreen = () => {
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    API.graphql(graphqlOperation(listUsers)).then((result) => {
      setUsers(result.data?.listUsers?.items);
    });
  }, []);

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <ContactListItem user={item} />}
      style={{ backgroundColor: "white" }}
    />
  );
};

export default ContactsScreen;
