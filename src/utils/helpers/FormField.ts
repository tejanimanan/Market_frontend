// types.ts or constants.ts

export interface FormField {
  label: string;
  name: string;
  type: 'input' | 'password' | 'select';
  isEdit?: boolean;
  rules: Rule[];
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

export type Rule = {
  required?: boolean;
  message: string;
  pattern?: RegExp;
  type?: 'email' | 'number' | 'string';
};

export const USER_FORM_FIELDS: FormField[] = [
  {
    label: "Unique Id",
    name: "uid",
    type: "input",
    rules: [{ required: true, message: "Please input the uid!" }],
  },
  {
    label: "Name",
    name: "name",
    type: "input",
    rules: [{ required: true, message: "Please input the name!" }],
  },
  {
    label: "Email",
    name: "email",
    type: "input",
    rules: [
      { required: true, message: "Please input the email!" },
      { type: "email", message: "Please enter a valid email!" },
    ],
  },
  // {
  //   label: "Set New Password",
  //   name: "password",
  //   type: "password",
  //   rules: [
  //     { required: false, message: "Please input the password!" },
  //   ],
  //   placeholder: "Leave blank to keep current password. Enter a new password to reset."
  // },
  {
    label: "Contact",
    name: "contact",
    type: "input",
    rules: [
      { required: true, message: "Please input the contact number!" },
      { pattern: /^\d{10}$/, message: "contact number must be 10 digits" },
    ],
  },
  // {
  //   label: "Role",
  //   name: "role",
  //   type: "select",
  //   rules: [{ required: true, message: "Please select a role!" }],
  //   options: [
  //     { value: "admin", label: "Admin" },
  //     { value: "company", label: "Company" },
  //     { value: "user", label: "User" },
  //   ],
  // },
  {
    label: "Status",
    name: "status",
    type: "select",
    rules: [{ required: true, message: "Please select status!" }],
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

export const SCRIPT_FORM_FIELDS: FormField[] = [
  {
    label: "Name",
    name: "name",
    type: "input",
    rules: [{ required: true, message: "Please input the script name!" }],
  },
  {
    label: "Current Rate",
    name: "current_rate",
    type: "input",
    rules: [
      { required: true, message: "Please input the current rate!" },
      { pattern: /^\d+(\.\d{1,2})?$/, message: "Enter a valid number!" },
    ],
  },
  {
    label: "Status",
    name: "status",
    type: "select",
    rules: [{ required: true, message: "Please select status!" }],
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    label: "High Value",
    name: "high_value",
    type: "input",
    rules: [
      { required: true, message: "Please input the high value!" },
      { pattern: /^\d+(\.\d{1,2})?$/, message: "Enter a valid number!" },
    ],
  },
  {
    label: "Low Value",
    name: "low_value",
    type: "input",
    rules: [
      { required: true, message: "Please input the low value!" },
      { pattern: /^\d+(\.\d{1,2})?$/, message: "Enter a valid number!" },
    ],
  },
  {
    label: "Volume",
    name: "volume",
    type: "input",
    rules: [
      { required: true, message: "Please input the volume!" },
      { pattern: /^\d+$/, message: "Enter a valid integer!" },
    ],
  },
  {
    label: "Closing Price",
    name: "closing_price",
    type: "input",
    rules: [
      { required: true, message: "Please input the closing price!" },
      { pattern: /^\d+(\.\d{1,2})?$/, message: "Enter a valid number!" },
    ],
  },
  {
    label: "Type",
    name: "type",
    type: "select",
    rules: [{ required: true, message: "Please select type!" }],
    options: [
      { value: "NSE", label: "NSE" },
      { value: "BSE", label: "BSE" },
    ],
  },
];

export const SHARE_FORM_FIELDS: FormField[] = [
  {
    label: "User",
    name: "user",
    type: "select",
    rules: [{ required: true, message: "Please select a user!" }],
    options: [],
  },
  {
    label: "Script",
    name: "script",
    type: "select",
    rules: [{ required: true, message: "Please select a script!" }],
    options: [],
  },
  {
    label: "Quantity",
    name: "qty",
    type: "input",
    rules: [
      { required: true, message: "Please input the quantity!" },
      { pattern: /^[0-9]+$/, message: "Quantity must be a number" },
    ],
  },
  {
    label: "Type",
    name: "type",
    type: "select",
    rules: [{ required: true, message: "Please select type!" }],
    options: [
      { value: "buy", label: "Buy" },
      { value: "sell", label: "Sell" },
    ],
  },
  {
    label: "Price",
    name: "price",
    type: "input",
    rules: [
      { required: true, message: "Please input the price!" },
      { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: "Enter a valid price" },
    ],
  },
  // {
  //   label: "Position",
  //   name: "position",
  //   type: "select",
  //   rules: [{ required: true, message: "Please select position!" }],
  //   options: [
  //     { value: "long", label: "Long" },
  //     { value: "short", label: "Short" },
  //   ],
  // },
  
];
