const express = require('express');
const router = express.Router(); 
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const Candidate = require('./../models/candidate');
const User = require('../models/user');


const checkAdminRole = async(userId) => {
    try {
        const user = await  User.findById(userId);
        if(user.role === 'admin'){
            return true;
        }
        }catch(err){
        return false;
    }
}
router.post('/', jwtAuthMiddleware,async (req, res) => {
    try {
        if(! (await checkAdminRole(req.user.id)))
            return res.status(403).json({message:'User is not admin'});
        
        const data = req.body
        const newCandidate = new Candidate(data); 
        const response = await newCandidate.save();
        console.log('data saved')
        res.status(200).json({response:response});    
   } catch (err) {
    console.log(err);
    res.status(500).json({error:'Internal Server Error'});
   }
}); 

router.put('/:candidateID',jwtAuthMiddleware,async (req, res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message:'User is not admin'});
        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData,{
            new: true,
            runValidators: true,
        })
        if(!response){
            return res.status(404).json({error:"Candidate not found"});
        }
        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
    res.status(500).json({error:'Internal Server Error'});
    }
})  

router.delete('/:candidateID',jwtAuthMiddleware,async (req, res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message:'User is not admin'});
        const candidateID = req.params.candidateID;
      
        const response = await Candidate.findByIdAndDelete(candidateID);
            
        if(!response){
            return res.status(404).json({error:"Candidate not found"});
        }
        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
    res.status(500).json({error:'Internal Server Error'});
    }
})  

router.post('/vote/:candidateID',jwtAuthMiddleware,async(req, res)=>{
    candidateID = req.params.candidateID;
    userId = req.user.id;
try {
    const candidate = await Candidate.findById(candidateID);
  if(!candidate){
        return res.status(404).json({message:"Candidate not found"});
    }
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    if(user.role==='admin'){
        res.status(403).json({message:"Admins cannot vote"});
    } 
    if(user.isVoted){
        res.status(400).json({message:"You have already voted"});
    }
    

    candidate.votes.push({user:userId})
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();
    res.status(200).json({message:"Voted successfully"});
}catch(err){
    console.log(err);
    res.status(500).json({error:'Internal Server Error'});
}
})

router.get('/vote/count', async (req, res)=>{
    try {
        const candidate = await Candidate.find().sort({voteCount: 'desc'});
        const voteRecord = candidate.map((data) =>{
            return {
                party: data.party,
                count: data.voteCount
            }
        });
        res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

router.get('/candidate', async (req, res) => {
    try {
       
        const candidate = await Candidate.find({}, 'name party -_id');

        res.status(200).json(candidate);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;