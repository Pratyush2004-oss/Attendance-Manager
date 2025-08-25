import { View, Text, Image } from "react-native";
import React from "react";

const Login = () => {
  return (
    <View className="items-center justify-center flex-1 bg-yellow-500">
      <View className="items-center justify-center h-2/3">
        <Image
          source={require("@/assets/images/authBanner.png")}
          className="object-contain w-64 h-64 aspect-video"
        />
      </View>
      <View className="items-center bg-blue-500 h-1/3">
        <Text>Login</Text>
      </View>
    </View>
  );
};

export default Login;
