import User from '../models/user.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import LoginSession from '../models/LoginSession.model.js'
import sendEmailAlert from '../utils/sendEmailAlert.js'


const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const AccessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })
    if (!AccessToken && !refreshToken) {
        throw new ApiError("Error while generating AccessToken or refreshToken", 500);
    }
    return { AccessToken, refreshToken };
}

const register = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;
    if (!userName || !email) {
        throw new ApiError("Username and Email can't be empty. Please provide both.", 400);
    }
    if (!password) {
        throw new ApiError("Please provide Password", 400);
    }
    if (password.length < 8) {
        throw new ApiError("Password length should be at least 8.", 400);
    }
    const AlreadyExistUser = await User.findOne({
        $or: [
            {
                userName: userName?.trim()
            },
            {
                email: email?.trim()
            }
        ]
    })
    if (AlreadyExistUser) {
        throw new ApiError("user Already exist with same userName or email", 400);
    }
    const user = await User.create({
        userName: userName?.trim(),
        email: email?.trim(),
        password: password
    })
    if (!user) {
        throw new ApiError("Error while creating user", 500)
    }
    const newUser = await User.findOne({ userName:userName.trim() }).select('-password -refreshToken');

    //info about user's session

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.useragent?.platform || 'unknown'

    const result = await LoginSession.create({
        owner: newUser._id,
        ipAddress: ip,
        device: device,

    });




    return res.status(200).json(new ApiResponse("User Created Successfully!", 200, newUser))
})

const logIn = asyncHandler(async (req, res) => {

    const { userName, email, password } = req.body;
    if (!userName && !email) {
        throw new ApiError("userName and email can't be empty", 400);
    }
    const user = await User.findOne({
        $or: [
            {
                userName: userName?.trim()
            },
            {
                email: email?.trim()
            }
        ]
    })
    if (!user) {
        throw new ApiError("User doesn't exist! please register first", 400);
    }
    const checkPassword = await user.comparePassword(password);
    if (!checkPassword) {
        throw new ApiError("Password is Wrong!!", 400);
    }
    const { AccessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const options = {
        httpOnly: true,
        secure: true
    }
    const newUser = await User.findOne({
        $or: [
            {
                userName: userName?.trim()
            },
            {
                email: email?.trim()
            }
        ]
    }).select('-password -refreshToken');

    //detection of session hijacking
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.useragent?.platform || 'unknown'

    const userInfo = await LoginSession.findOne({ owner: newUser._id });

    if (!userInfo) {
        if (newUser.lastSession && (ip !== newUser.lastSession.ipAddress || device !== newUser.lastSession.device)) {
            await sendEmailAlert(ip, device, newUser.email);
        }
        await LoginSession.create({
            owner: newUser._id,
            ipAddress: ip,
            device: device
        });

    }
    else if ((ip !== userInfo.ipAddress || device !== userInfo.device)) {
        await sendEmailAlert(ip, device, newUser.email);
        userInfo.ipAddress = ip;
        userInfo.device = device;
        await userInfo.save();
    }




    res.status(200).cookie("accessToken", AccessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse("logged In SuccessFully", 200, newUser))

})

const logOut = asyncHandler(async (req, res) => {

    const userId = req?.user._id;
    if (!userId) {
        throw new ApiError("LogIn first Please", 400);
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    user.refreshToken = undefined;

    const info = await LoginSession.findOne({ owner: userId });
    if (info) {
        user.lastSession = {
            ipAddress: info.ipAddress,
            device: info.device
        };
    }
    await user.save();

    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse("logged out Successfully!!", 200, {}));
})

const infoAboutUser = asyncHandler(async (req, res) => {
    const userId = req?.user._id;
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError("User doesn't exist", 400);
    }
    res.status(200).json(new ApiResponse("Info", 200, user));
})

const refreshAccessAndrefreshToken = asyncHandler(async (req, res) => {
    const refreshToken1 = req.cookies.refreshToken;
    if (!refreshToken1) {
        throw new ApiError("Invalid token", 400);
    }
    const user = await User.findOne({ refreshToken: refreshToken1 });
    if (!user) {
        throw new ApiError("User doesn't exist", 400);
    }
    const { AccessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200).cookie("accessToken", AccessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse("Access and refresh Token updated!!", 200, {}))

})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
     if (!newPassword) {
        throw new ApiError("Password is required!!", 400);
    }
    if (newPassword.length < 8) {
        throw new ApiError("Password length should be more than 8", 400);
    }
    if (!oldPassword) {
        throw new ApiError("Password is required!!", 400);
    }
    const user = await User.findById(req.user._id);
    const check = await user.comparePassword(oldPassword);
    if (!check) {
        throw new ApiError("Old Password is Incorrect", 400);
    }
    user.password = newPassword;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.useragent?.platform || 'unknown'
    user.lastSession = {
        ipAddress: ip,
        device: device
    }
    await user.save();
    await LoginSession.findOneAndDelete({ owner: user._id });
    return res.status(200).json(new ApiResponse("password changed!!", 200, {}));
})

export { register, logIn, logOut, infoAboutUser, refreshAccessAndrefreshToken, changePassword }