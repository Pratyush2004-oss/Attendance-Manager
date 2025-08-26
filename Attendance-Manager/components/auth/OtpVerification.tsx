import { TextInput, View } from "react-native";
import React, { useRef, useState } from "react";

// In the OtpVerification component
interface OtpVerificationProps {
  onOtpChange: (otp: string) => void;
}
export default function OtpVerification({ onOtpChange }: OtpVerificationProps) {
  const [otpArray, setOtpArray] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<TextInput[]>([]);

  const handleInputChange = (index: number, value: string) => {
    const newOtpArray = [...otpArray];
    newOtpArray[index] = value;
    setOtpArray(newOtpArray);
    if (value !== "") {
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
    const otp = newOtpArray.join("");
    onOtpChange(otp);
  };

  const handleKeyPress = (index: number, event: any) => {
    if (event.nativeEvent.key === "Backspace") {
      if (index > 0) {
        inputRefs.current[index - 1].focus();
        const newOtpArray = [...otpArray];
        newOtpArray[index - 1] = "";
        setOtpArray(newOtpArray);
      }
    }
  };
  return (
    <View className="flex-row justify-center gap-3">
      {otpArray.map((otp, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) {
              inputRefs.current[index] = ref;
            }
          }}
          className="w-12 px-3 py-2 text-xl text-center bg-white rounded-md"
          maxLength={1}
          value={otp}
          onChangeText={(text) => handleInputChange(index, text)}
          onKeyPress={(event) => handleKeyPress(index, event)}
          keyboardType="numeric"
        />
      ))}
    </View>
  );
}
