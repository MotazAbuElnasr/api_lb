const Joi = require("@hapi/joi");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const passwordValidator = require("password-validator");
const checkUserErrors = user => {
  const passwordSchema = new passwordValidator();
  passwordSchema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(30) // Maximum length 30
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols();

  const userSchema = Joi.object().keys({
    firstName: Joi.string()
      .regex(/^[a-zA-Z']+$/)
      .min(3)
      .max(20)
      .required(),
    lastName: Joi.string()
      .regex(/^[a-zA-Z]+$/)
      .min(3)
      .max(20)
      .required(),
    email: Joi.string()
      .email({ minDomainSegments: 2 })
      .required(),
    password: Joi.required(),
    confirmPassword: Joi.required(),
    phoneNumber: Joi.required(),
    username: Joi.string()
      .min(3)
      .max(20)
      .required()
  });
  //* get schema errors
  const { error: userSchemaErrors } = Joi.validate(user, userSchema, {
    abortEarly: false
  });

  const userErrors = userSchemaErrors
    ? userSchemaErrors.details.map(error => {
        const fields = {
          firstName: "First name",
          lastName: "Last name",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirmed password",
          phoneNumber: "Phone number",
          username: "username"
        };
        const errorMsgs = {
          "string.regex.base": `${
            fields[error.path[0]]
          } should contain only letters`,
          "string.min": `${
            fields[error.path[0]]
          } should be at least 3 characters`,
          "string.max": `${
            fields[error.path[0]]
          } shouldn't exceed 20 characters `,
          "any.required": `${fields[error.path[0]]} shouldn't be blank `,
          "any.empty": `${fields[error.path[0]]} shouldn't be blank `,
          "string.email": "Email is invalid"
        };
        console.log(error.type);
        return errorMsgs[error.type];
      })
    : [];
  //   * password validation
  const { password, confirmPassword, phoneNumber } = user;
  if (password && confirmPassword && !passwordSchema.validate(password)) {
    userErrors.push(
      `Password should contain at least 1 special character, 1 uppercase , 1 lowercase,1 number and 8 letters at least`
    );
  }
  if (password !== confirmPassword) {
    userErrors.push("Passwords don't match");
  }
  //   *phone validation
  if (phoneNumber) {
    const parsedPhone = parsePhoneNumberFromString(phoneNumber);
    if (
      !parsedPhone ||
      !parsedPhone.isValid() ||
      (phoneNumber.slice(0, 3) == "+20" && phoneNumber.length !== 13)
    ) {
      userErrors.push("Phone number is not valid");
    }
  }
  return userErrors;
};
module.exports = { checkUserErrors };
