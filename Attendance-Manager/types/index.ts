export type loginInputInput = {
  email: string;
  password: string;
};

export type signupInputType = {
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" |"";
  Organization: string[];
};

export type verifyEmailInputType = {
  email: string;
  otp: string;
};

export type resetPasswordInputType = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export type UserType = {
  _id: string;
  name: string;
  email: string;
  role: ["student", "teacher"];
  Organization: string[] | string;
  guardian: {
    name: string | null;
    number: string | null;
  };
};

export type BatchForStudentType = {
  _id: string;
  name: string;
  Organization: string;
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
};

export type BatchForTeacherType = {
  _id: string;
  name: string;
  Organization: string;
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  students: string[];
};

export type OrganizationType = {
  _id: string;
  name: string;
};

export type AttendanceForStudentType = {
  _id: string;
  date: Date;
  batchName: string;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  attendanceRecords: {
    date: Date;
    status: "present" | "absent" | "leave";
  }[];
};
