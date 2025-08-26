import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
const Login = () => {
  const router = useRouter();
  const [showPassword, setshowPassword] = useState(false);
  return (
    <KeyboardAvoidingView
      className="items-center justify-between flex-1 bg-gray-300"
      behavior={"padding"}
    >
      {/* Image section */}
      <View className="items-center justify-center w-full h-2/5">
        <Image
          source={require("@/assets/images/authBanner.png")}
          className="object-contain w-64 h-64 rounded-3xl aspect-video"
        />
      </View>

      {/* Form section */}
      <View className="items-center w-full rounded-t-3xl bg-blue-500/70 h-3/5">
        <View className="items-center justify-between flex-1 w-full p-5">
          <View className="items-center justify-center w-full">
            <View className="w-full gap-3 px-3">
              <Text className="text-3xl text-center text-white">
                Attandance Manager
              </Text>
              <Text className="text-lg text-center text-white">
                Manage, View and Mark Your Attendance, Effortlessly
              </Text>
            </View>
            {/* Login form */}
            <View className="w-full gap-5">
              <View className="w-full gap-2">
                <Text className="ml-3 text-xl font-bold text-white">Email</Text>
                <TextInput
                  placeholder="john.doe@example.com"
                  className="w-full px-3 py-2 text-xl bg-white rounded-md"
                />
              </View>
              <View className="relative w-full gap-2">
                <Text className="ml-3 text-xl font-bold text-white">
                  Password
                </Text>
                <TextInput
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  className="w-full px-3 py-2 text-xl bg-white rounded-md"
                />
                <Pressable
                  className="absolute -translate-y-1/2 right-3 top-3/4"
                  onPress={() => setshowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color="black"
                  />
                </Pressable>
              </View>
              <TouchableOpacity className="w-full px-3 py-2 rounded-md bg-blue-900/70">
                <Text className="text-2xl text-center text-white">Login</Text>
              </TouchableOpacity>
            </View>
            <Pressable
              className="items-end w-full mt-1"
              onPress={() => router.push("/(auth)/forgotPassword")}
            >
              <Text className="text-lg text-blue-700 text-end ">
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          {/* Footer for Signup */}
          <View className="flex-row items-center justify-center w-full gap-2 py-2 border-t-2 border-white">
            <Text className="text-xl text-white">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-xl text-blue-700">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;
