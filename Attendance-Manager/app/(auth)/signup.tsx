import AuthHeader from "@/components/auth/AuthHeader";
import { signupInputType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
const Signup = () => {
  const router = useRouter();
  const [showPassword, setshowPassword] = useState(false);
  const [input, setInput] = useState<signupInputType>({
    email: "",
    name: "",
    Organization: [""],
    password: "",
    role: "",
  });
  return (
    <KeyboardAvoidingView
      className="items-center justify-between flex-1 bg-gray-300"
      behavior="padding"
    >
      {/* Form section */}
      <View className="items-center flex-1 w-full rounded-t-3xl bg-blue-500/70">
        <View className="relative items-center justify-between flex-1 w-full p-5">
          {/* Header */}
          <AuthHeader />
          {/* Signup form */}

          <View className="items-center justify-center w-full">
            <View className="w-full gap-5">
              <View className="w-full gap-2">
                <Text className="ml-3 text-xl font-bold text-white">Name</Text>
                <TextInput
                  placeholder="John Doe"
                  className="w-full px-3 py-2 text-xl bg-white rounded-md"
                />
              </View>
              <View className="w-full gap-2">
                <Text className="ml-3 text-xl font-bold text-white">Email</Text>
                <TextInput
                  placeholder="john.doe@example.com"
                  className="w-full px-3 py-2 text-xl bg-white rounded-md"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  onPress={() => setshowPassword  (!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color="black"
                  />
                </Pressable>
              </View>

              {/* Add the following code to your JSX */}
              <View className="flex-row w-full gap-2">
                <View className="flex-row items-center gap-2">
                  <Text className="ml-3 text-xl font-bold text-white">
                    Role:
                  </Text>
                  <View className="">
                    <TouchableOpacity
                      className="flex-row gap-2 mr-3"
                      onPress={() => {
                        if (input.role === "student")
                          setInput({ ...input, role: "" });
                        else setInput({ ...input, role: "student" });
                      }}
                    >
                      {input.role === "student" ? (
                        <View className="ml-2">
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#fff"
                          />
                        </View>
                      ) : (
                        <View className="ml-2">
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={20}
                            color="#fff"
                          />
                        </View>
                      )}
                      <Text className="text-xl font-bold text-white">
                        Student
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row gap-2 mr-3"
                      onPress={() => {
                        if (input.role === "teacher")
                          setInput({ ...input, role: "" });
                        else setInput({ ...input, role: "teacher" });
                      }}
                    >
                      {input.role === "teacher" ? (
                        <View className="ml-2">
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#fff"
                          />
                        </View>
                      ) : (
                        <View className="ml-2">
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={20}
                            color="#fff"
                          />
                        </View>
                      )}
                      <Text className="text-xl font-bold text-white">
                        Teacher
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="ml-3 text-xl font-bold text-white">
                    Organization:
                  </Text>
                  <Picker
                    className="px-3 py-2 text-xl bg-white rounded-md "
                    selectedValue={""}
                    onValueChange={(itemValue) =>
                      setInput({ ...input, Organization: [itemValue] })
                    }
                  >
                    <Picker.Item label="Select Organization" value="" />
                    <Picker.Item
                      label="Organization 1"
                      value="Organization 1"
                    />
                    <Picker.Item
                      label="Organization 2"
                      value="Organization 2"
                    />
                    <Picker.Item
                      label="Organization 3"
                      value="Organization 3"
                    />
                  </Picker>
                </View>
              </View>
              <TouchableOpacity className="w-full px-3 py-2 rounded-md bg-blue-900/70">
                <Text className="text-2xl text-center text-white">Signup</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer for Signup */}
          <View className="w-full ">
            <View className="items-center justify-center w-full my-2 ">
              <Text className="text-lg text-center text-white">
                Already have an account but not verified
              </Text>
              <Pressable
                className="w-1/2"
                onPress={() => router.push("/(auth)/verifyEmail")}
              >
                <Text className="text-lg text-center text-blue-700">
                  Verify Account
                </Text>
              </Pressable>
            </View>
            <View className="flex-row items-center justify-center w-full gap-2 py-2 border-t-2 border-white">
              <Text className="text-xl text-white">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)")}>
                <Text className="text-xl text-blue-700">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Signup;
