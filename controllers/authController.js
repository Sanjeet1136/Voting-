const User = require('../models/user');
const { generateToken } = require('../jwt');
const validator = require('validator');
// const bcrypt = require('bcrypt');

const signup = async (req, res) =>{
    try{
        const data = req.body 
        
        const { email } = data;
 
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        if (!/^\d{14}$/.test(data.citizenshipNumber)) {
            return res.status(400).json({ error: 'Citizenship Number must be exactly 14 digits' });
        }

        if (data.age<18){
            return res.status(400).json({ error: 'User must be at least 18 years old' });
        }
 
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const existingUser = await User.findOne({ citizenshipNumber: data.citizenshipNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Citizenship Number already exists' });
        }

    
        const newUser = new User(data);

      
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


const login = async(req, res) => {
    try{
       
        const {citizenshipNumber, password} = req.body;

        
        if (!citizenshipNumber || !password) {
            return res.status(400).json({ error: 'Citizenship Number and password are required' });
        }

        const user = await User.findOne({citizenshipNumber: citizenshipNumber});

        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid Citizenship Number or Password'});
        }

        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        res.status(200).json({
            user: {
              id: user._id,
              name: user.name,
              token: token
            }
    });

    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    signup,
    login
};