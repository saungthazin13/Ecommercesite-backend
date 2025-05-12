import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator"; //for  body validation middleware
import {
  getUserByPhone,
  createOtp,
  getOtpByPhone,
  updateOtp,
} from "../services/authServices";
import { checkUserAccount, checkOtpErrorIfSameDate } from "../utils/auth";
import { generateOtp, generateToken } from "../utils/OTP";
import bcrypt from "bcrypt"; //for hashing in Otp

//09256939195 register for phone
export const register = [
  body("phone", "Invalid phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = "Error-Invalid";
      return next(error);
    }

    //not for error:reach for this message remove for 09
    let phone = req.body.phone;
    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }
    const user = await getUserByPhone(phone); //recall for authServices.ts
    checkUserAccount(user);

    //Generate OTP
    //include for sent to user phone number and save OTP to db
    //how to cteate for db
    const otp = 123456; //for testing
    // const otp = generateOtp(); // for production
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp.toString(), salt);
    const token = generateToken(); //token

    //OTP for 1day for 5 times
    const OtpRow = await getOtpByPhone(phone);
    let result;
    if (!OtpRow) {
      const otpData = {
        phone,
        otp: hashOtp, //hash this OTP
        remembertoken: token,
        count: 1,
      };
      result = await createOtp(otpData);
    } else {
      const lastOtpRequest = new Date(OtpRow.updatedAT).toLocaleDateString();
      const today = new Date().toLocaleDateString();
      const isSameDate = lastOtpRequest === today;
      checkOtpErrorIfSameDate(isSameDate, OtpRow.errors);
      if (!isSameDate) {
        const otpData = {
          otp: hashOtp,
          remembertoken: token,
          count: 1,
          error: 1,
        };
        result = await updateOtp(OtpRow.id, otpData);
      } else {
        if (OtpRow.count === 3) {
          const error: any = new Error(
            "OTP is allowed to request 3 times per day"
          );
          error.status = 405;
          error.code = "Error-Invalid";
          return next(error);
        }
        {
          const otpData = {
            otp: hashOtp,
            remembertoken: token,
            count: OtpRow.count + 1,
          };
          result = await updateOtp(OtpRow.id, otpData);
        }
      }
    }

    res.status(200).json({
      message: `We are sending OTP  to 09${result.phone}`,
      phone: result.phone,
      token: result.remembertoken,
    }); //for apiအတွက်jsonသုံး
  },
];

//verify for otp
export const verifyOtp = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("otp", "Invalid OTP")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid token").trim().notEmpty().escape(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = "Error-Invalid";
      return next(error);
    }
    res.status(200).json({ message: "verifyOtp" });
  },
];

export const confirmPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({ message: "confirmPassword" });
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({ message: "login" });
};
