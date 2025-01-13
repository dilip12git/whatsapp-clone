const express = require('express');
const {sendOTP} = require('./sendOTP.js');
const User = require('../../Models/user.js');
const router = express.Router();

router.post('/sendOTP', async (req, res) => {
    
    const {name,email} = req.body;
    let user = await User.findOne({email});
    const digits ='0123456789';
    let otp='';

    if(user){
        return res.status(400).send({message:'User already exists'})
    }
   
    for(let i=0;i<6;i++){
        otp+=digits[Math.floor(Math.random()*10)]
    }

    const result = sendOTP(name,email,otp);
    res.status(200).send({otp:otp,message:'OTP sent successufully !!!'})
});

module.exports = router;