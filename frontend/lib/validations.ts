import Joi from "joi";

export const signinSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

// Define the Joi schema
export const createUserSchema = Joi.object({
  full_name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 3 characters",
    "string.max": "Full name must be at most 50 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  address: Joi.string().min(5).max(200).required().messages({
    "string.empty": "Address is required",
    "string.min": "Address must be at least 5 characters",
    "string.max": "Address must be at most 200 characters",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be 10 digits",
    }),
});

export const createCakesSchema = Joi.object({
  cake_name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Cake name is required",
    "string.min": "Cake name must be at least 2 characters",
    "string.max": "Cake name must be at most 100 characters",
  }),
  price: Joi.number().min(1).required().messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be at least 1",
    "any.required": "Price is required",
  }),
  cake_type: Joi.string().required().messages({
    "string.empty": "Cake type is required",
  }),
  flavour: Joi.string().required().messages({
    "string.empty": "Flavour is required",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Category is required",
  }),
  noofpeople: Joi.number().min(1).required().messages({
    "number.base": "Number of people must be a number",
    "number.min": "Number of people must be at least 1",
    "any.required": "Number of people is required",
  }),
  size: Joi.string().required().messages({
    "string.empty": "Size is required",
  }),
});
