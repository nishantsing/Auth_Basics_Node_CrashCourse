# JWTBasics

- jsonwebtoken npm package

### Postman Setup
### Jsonwebtoken Explanation and Setup

[JWT Introduction](https://jwt.io/introduction)
[JWT Debugger](https://jwt.io/#debugger-io)
- In login route create the token

```js
// inside login route
// try to keep payload small, better experience for user
  // just for demo, in production use long, complex and unguessable string value!!!!!!!!!
  const token = jwt.sign({ id, username }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })

```
### authorization header setup
- once you access the login route you get the secret token add it to the autorization header of dashboard route.

### auth middleware
- In middleware which can be used in every route we extract the token from req.headers.authorization

```js
const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('No token provided')
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { id, username } = decoded
    req.user = { id, username }
    next()
  } catch (error) {
    throw new UnauthenticatedError('Not authorized to access this route')
  }
}

// routes/main
router.route('/dashboard').get(authMiddleware, dashboard) // adding auth middleware for the route
```

### Creating Admin Auth Middleware


```js
const adminAuthMiddleware = async (req, res, next)=>{
    const userId = req.user // coming from the auth middleware
    const user = await User.findById(userId);

    if(!user.isAdmin){// isAdmin a property of User Schema
        return res.status(404).send({message: 'Not Authorized' })
    } 
    next();

}

// routes/main
router.route('/dashboard').get(authMiddleware, adminAuthMiddleware, dashboard) // Now only the admin can access the dashboard route

```

### Error Handler Middleware

```js
// middleware/error-handler
const { CustomAPIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message })
  }
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send('Something went wrong try again later')
}

module.exports = errorHandlerMiddleware

// middleware/not-found.js

const notFound = (req, res) => res.status(404).send('Route does not exist')

module.exports = notFound


// app.js
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


```


### Status codes
- npm library for status codes -  http-status-codes

### Handling Errors

```js

// errors/custom-error
class CustomAPIError extends Error {
  constructor(message) {
    super(message)
  }
}

module.exports = CustomAPIError


// errors/bad-request
const CustomAPIError = require('./custom-error')
const { StatusCodes } = require('http-status-codes')
class BadRequest extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.BAD_REQUEST
  }
}
module.exports = BadRequest


// errors/unauthenticated
const CustomAPIError = require('./custom-error')
const { StatusCodes } = require('http-status-codes')

class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.UNAUTHORIZED
  }
}

module.exports = UnauthenticatedError


// controller or middleware
throw new BadRequestError('Please provide email and password')
throw new UnauthenticatedError("No token provided");

```

### Notes

- No cors required if you are triggering the public files using the express server itself because the origin is same but if you try to host them using vscode live server, you might face some cors issue because you will need to run them on different ports which is different origin.
which can be easily fixed using the npm package cors

```js
const cors = require('cors')
app.use(cors())
```
- Changing the URL path for static files
app.use('/static',express.static("./public")); 


# PassportAuth_Node_CrashCourse

## Difference between JWT and Passport

- JWT is a Stateless authentication while passport is a flexible and modular approach to implementing various authentication strategies(e.g., local, OAuth, JWT).
    - Stateless authentication
        - The server does not store any session data about the client between requests. Each request from the client must contain all the information needed to verify the user's identity and permissions.
        - The most common form of stateless authentication uses tokens. When a user logs in, the server issues a token that the client stores (e.g., in local storage or a cookie). The client then sends this token with each subsequent request.
        - Tokens like JWTs are self-contained, meaning they carry all the necessary information about the user, such as their identity and any claims (permissions). The token is signed by the server to prevent tampering.
- JWT is scalable and in passport a JWT strategy can be used to implement the same.

- npm init (express ejs bcrypt passport passport-local express-session express-flash method-override) (nodemon dotenv)
- using template engine like ejs
- To extend it connect to db and do it

```js
//app.js
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const initializePassport = require('./passport-config')
const methodOverride = require('method-override')
initializePassport(
    passport, 
    email=> users.find(user=>user.email===email)
     id => users.find(user => user.id === id)
)

const users = []
app.set('view-engine','ejs')
// Change the directory for views
// app.set('views', path.join(__dirname, 'templates')); // if not set look for views folder in root directory
app.use(express.urlencoded({extended: false})) // get form data in req variable

app.use(flash())
app.use(session({
    secret: something// add this to .env file and if it has space enclose in quotes
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req,res)=>{
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req,res)=>{
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req,res)=>{
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id:Date.now().toString(),
            name: req.body.name
            email: req.body.email
            password: hashedPassword
        })
        res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
    

})

Passport 0.6.0, where req.logout now requires a callback function to handle asynchronous operations.
app.delete('/logout', (req, res, next) => {
  req.logout(err=>{
    if(err){return next(err)}
    res.redirect('/login')
  }) //passport
  
})



function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

// index.ejs


<h1>Hi <%= name %> </h1>
<form action="/logout?_method=DELETE" method="POST">
  <button type="submit">Log Out</button>
</form>


// login.ejs

<% if(messsages.error) { %>
<%= messages.error %>
<% } %>

// resgister.ejs
<h1>Register</h1>
<form action="/register" method="POST">
// ..name email password input fields
</form>

// passport-config.js
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

 function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id)) 
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize
```