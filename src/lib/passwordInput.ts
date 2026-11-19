// Phones often add a space after a word or autofill a saved password,
// which made "Passwords do not match" appear even when the user typed the same thing.
export const cleanPassword = (value: string) => value.replace(/^\s+|\s+$/g, "");

// Stops phone keyboards from capitalising, autocorrecting or autofilling an old password.
export const newPasswordInputProps = {
  autoComplete: "new-password",
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: false,
} as const;
