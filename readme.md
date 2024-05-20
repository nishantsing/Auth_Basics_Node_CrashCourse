## JWTBasics

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
