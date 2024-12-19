require('dotenv').config()
const cors= require('cors')
const mongoose=require('mongoose')

const PORT=process.env.PORT||3000
const userrouter=require('./userRouter')
const adminRouter = require('./adminRouter')
const express=require('express')
const app= express()
const cookieparser=require('cookie-parser')
const session=require('express-session')
const passport=require('../backend/passport')


mongoose.connect(process.env.MONGODB_URL)
const corsOptions={
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow your client app's origin
    credentials: true, // Allow credentials (cookies) to be sent
}
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieparser())
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,  // if it move to real website change to true
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))
app.use(passport.initialize())
app.use(passport.session())  
app.use('/',userrouter)
app.use('/admin', adminRouter)


app.listen(PORT,()=>{
    console.log(`server is running in port ${PORT}`)
})

