export function isEmail(str) {
  if (!str) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

export function isStrongPassword(str) {
  if (!str) return false;
  return str.length >= 8 && /[A-Z]/.test(str) && /[a-z]/.test(str) && /[0-9]/.test(str);
}

export function isMinLength(str, min) {
  return (str || "").length >= (min || 1);
}

export function isUrl(str) {
  if (!str) return false;
  return /^https?:\/\/.+\..+/.test(str.trim());
}

export function validateField(value, rules) {
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    if (rule.required && !value) return rule.message || "Required";
    if (rule.minLength && (value || "").length < rule.minLength) return rule.message || "Too short";
    if (rule.maxLength && (value || "").length > rule.maxLength) return rule.message || "Too long";
    if (rule.email && value && !isEmail(value)) return rule.message || "Invalid email";
    if (rule.pattern && value && !rule.pattern.test(value)) return rule.message || "Invalid format";
    if (rule.custom && !rule.custom(value)) return rule.message || "Invalid";
  }
  return null;
}
