import { Text, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

dayjs.extend(relativeTime);

const ContactListItem = ({
  user,
  onPress = () => {},
  selectable = false,
  isSelected = false,
}) => {
  const navigation = useNavigation();
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
      {selectable &&
        (isSelected ? (
          <AntDesign name="checkcircle" size={24} color="royalblue" />
        ) : (
          <FontAwesome name="circle-thin" size={24} color="lightgray" />
        ))}
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
    marginRight: 10,
  },
  name: {
    fontWeight: "bold",
  },
  subTitle: {
    color: "gray",
  },
});

export default ContactListItem;
