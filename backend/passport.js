require('dotenv').config()
const passport=require('passport')
const GoogleStrategy=require('passport-google-oauth20')
const User= require('../backend/mongodb')


passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENTID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackurl:'/auth/google/callback'
},

async (accessToken,refreshToken,profile,done)=>{
    try {
        let user=await User.findOne({googleId:profile.id})
        if(user){
            return done(null,user)
        }
        else{
           const user=new User({
                name:profile.displayName,
                email:profile.emails[0].value,
                googleId:profile.id
            })
            await user.save()
            return done(null,user) 
        }
    } catch (error) {
        return done(null,error) 
    }
}
))
passport.serializeUser((user,done)=>{ //store user details in session
    done(null,user.id)
});

passport.deserializeUser((id,done)=>{
    User.findById(id)
        .then(user=>{
            done(null,user)
        })
        .catch(err =>{
            done(err,null)
        })
})

module.exports=passport