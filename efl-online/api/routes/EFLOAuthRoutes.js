// server/routes/EFLOAuthRoutes.js
const express = require('express');
const { getUsers, GetActiveUser, GenerateAuthToken, ValidateAuthToken, HelloWorld } = require('../controllers/EFLOAuthController');
const router = express.Router();

router.get('/EFLOAuth/Hello', HelloWorld);
router.get('/EFLOAuth/GetUser', getUsers);

router.post('/EFLOAuth/GenerateAuthToken', GenerateAuthToken); //generateAuthTOken
router.post('/EFLOAuth/ValidateAuthToken', ValidateAuthToken); //generateAuthTOken
router.post('/EFLOAuth/ActiveUser', GetActiveUser); //generateAuthTOken

//EXAMPLE ONLY
//router.post('/EFLOAuth/CreatePlayer', createPlayer); // Route with request body


module.exports = router;