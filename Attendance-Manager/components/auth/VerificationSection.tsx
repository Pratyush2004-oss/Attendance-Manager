import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import OtpVerification from "./OtpVerification";
import { verifyEmailInputType } from "@/types";

interface VerificationSectionProps {
  email?: string;
}

const VerificationSection: React.FC<VerificationSectionProps> = () => {
  const [input, setinput] = useState<verifyEmailInputType>({
    email: "",
    otp: "",
  });

  const handleOtpChange = (otp: string) => {
    setinput({ ...input, otp });
  };

  const handleSubmit = () => {
    console.log(input);
  };
  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="items-center justify-center w-full"
    >
      <View className="items-center justify-center w-full px-4">
        <View className="w-full gap-5">
          <View className="w-full gap-2">
            <Text className="ml-3 text-xl font-bold text-white">Email</Text>
            <TextInput
              placeholder="john.doe@example.com"
              className="w-full px-3 py-2 text-xl bg-white rounded-md"
              keyboardType="email-address"
              value={input.email}
              onChangeText={(text) => setinput({ ...input, email: text })}
            />
          </View>
          <View className="w-full gap-2">
            <Text className="ml-3 text-xl font-bold text-white">Otp</Text>
            <OtpVerification onOtpChange={handleOtpChange} />
          </View>
          <TouchableOpacity
            className="w-full px-3 py-2 rounded-md bg-blue-900/70"
            onPress={handleSubmit}
          >
            <Text className="text-2xl text-center text-white">
              Verify Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerificationSection;
