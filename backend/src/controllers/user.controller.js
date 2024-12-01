import httpStatus from "http-status";
import {User} from "../models/user.model.js";
import bcrypt,{hash} from "bcrypt";
import crypto from "crypto";


// Register
const register = async (req,res) => {
    const {name,username,password} = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({
                message: "User already exists"
            });
        } 
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(httpStatus.CREATED).json({
            message: "User registered successfully"
        });
    } catch (error) {
        res.json({
            message: `Error registering user ${error}`
        })
    }
}

//Login
const login = async (req, res) => {
  const {username, password } = req.body;

  if(!username || !password){
    return res.status(httpStatus.BAD_REQUEST).json({
        message: "Please enter both username and password"
    })
  };

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User Not Found",
      });
    }
    if(bcrypt.compare(password,user.password)){
        let token = crypto.randomBytes(20).toString("hex");
        user.token = token;
        await user.save();
        return res.status(httpStatus.OK).json({
            message: "Login Success",
            token: token,
        })
    }
  } catch (error) {
    return res.status(500).json({
      message: `Something Went Wrong ${error}`,
    });
  }
};



export {login,register};