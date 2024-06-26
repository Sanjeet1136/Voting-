const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

app.use(express.json())
var database

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Voting App',
            version: '1.0.0'
            },
            servers: [
                {
                    url:'http://localhost:3000'
                }
        ],
    },
    apis: ['./routes/candidateRoutes.js','./routes/userRoutes.js'],
}
const swaggerSpec = swaggerJSDoc(options)
app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec))

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); 
const PORT = process.env.PORT || 3000;

const routeCache = require('./routeCache');
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');


app.use('/user',routeCache(86400), userRoutes);
app.use('/candidate',routeCache(86400), candidateRoutes);


app.listen(PORT, ()=>{
    console.log('listening on port 3000');
})