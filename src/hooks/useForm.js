import { useState } from "react";

export default function useForm(initialValues) {
  var [values, setValues] = useState(initialValues || {});
  var [errors, setErrors] = useState({});
  var [submitting, setSubmitting] = useState(false);

  function setValue(key, val) {
    setValues(function (prev) {
      var next = Object.assign({}, prev);
      next[key] = val;
      return next;
    });
    // Clear error on change
    if (errors[key]) {
      setErrors(function (prev) {
        var next = Object.assign({}, prev);
        delete next[key];
        return next;
      });
    }
  }

  function setError(key, msg) {
    setErrors(function (prev) {
      var next = Object.assign({}, prev);
      next[key] = msg;
      return next;
    });
  }

  function validate(rules) {
    var newErrors = {};
    Object.keys(rules).forEach(function (key) {
      var rule = rules[key];
      var val = values[key];
      if (rule.required && (!val || (typeof val === "string" && !val.trim()))) {
        newErrors[key] = rule.message || key + " is required";
      }
      if (rule.minLength && val && val.length < rule.minLength) {
        newErrors[key] = rule.message || key + " must be at least " + rule.minLength + " characters";
      }
      if (rule.pattern && val && !rule.pattern.test(val)) {
        newErrors[key] = rule.message || key + " is invalid";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function reset() {
    setValues(initialValues || {});
    setErrors({});
    setSubmitting(false);
  }

  return { values, errors, submitting, setValue, setError, setSubmitting, validate, reset };
}
