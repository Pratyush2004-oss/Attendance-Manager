import AuthHeader from "@/components/auth/AuthHeader";
import VerificationSection from "@/components/auth/VerificationSection";
import { useRouter } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function verifyEmail() {
  const router = useRouter();
  return (
    <View className="items-center flex-1 w-full rounded-t-3xl bg-blue-500/70">
      <View className="relative items-center justify-between flex-1 w-full p-5">
        <AuthHeader />
        {/* Signup form */}
        <VerificationSection />

        {/* Footer for Signup */}
        <View className="w-full ">
          <View className="flex-row items-center justify-center w-full gap-2 py-2 border-t-2 border-white">
            <Text className="text-xl text-white">Login to your account?</Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)")}>
              <Text className="text-xl text-blue-700">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
