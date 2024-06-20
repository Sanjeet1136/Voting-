const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');


router.post('/signup', async (req, res) => {
    try {
        const data = req.body
        const newUser = new User(data); 
        const response = await newUser.save();
        console.log('data saved')

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is :", token);
        res.status(200).json({response:response, token:token});    
   } catch (err) {
    console.log(err);
    res.status(500).json({error:'Internal Server Error'});
   }
});

router.post('/login', async(req, res) => {
    try{
        const {citizenshipNumber, password} = req.body;
        if (!citizenshipNumber || !password) {
            return res.status(400).json({ error: 'Citizenship Number and password are required' });
        }
        const user = await User.findOne({citizenshipNumber});
        if( !user){
            return res.status(401).json({error: 'Invalid Citizenship Number or Password'});
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid Citizenship Number or Password' });
        }
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/profile',jwtAuthMiddleware, async (req, res)=> {
try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({user});
}catch(err) { 
    console.error(err); 
    res.status(500).json({error:'Internal Server Error'});
}
})

router.put('/profile/password',jwtAuthMiddleware,async (req, res)=>{
    try{
        const userId = req.user.id;
        const {currentPassword,newPassword} = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        const user = await User.findById(userId);

        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
 


module.exports = router;