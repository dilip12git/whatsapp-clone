const express = require('express');
const {sendResetPassOTP} = require('./sendResetPassOTP.js');
const User = require('../../Models/user.js');

const router = express.Router();

router.post('/sendResetPassOTP', async (req, res) => {

    const {email} = req.body;
    let user = await User.findOne({email});
    const digits ='0123456789';
    let otp='';

    if(!user){
        return res.status(400).send({message:'User record not found !!'})
    }
   
    for(let i=0;i<6;i++){
        otp+=digits[Math.floor(Math.random()*10)]
    }
   sendResetPassOTP(email,otp);
    res.status(200).send({otp:otp,message:'OTP sent successufully !!!'})
});

module.exports = router;