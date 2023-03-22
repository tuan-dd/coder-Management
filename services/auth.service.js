const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authService = {
   validatePassword: async function (originalPassword, password) {
      const validPassword = await bcrypt.compare(password, originalPassword);
      return validPassword;
   },
   generateToken: async function (user) {
      const accessToken = jwt.sign(
         {
            email: user.email,
            position: user.position,
         },
         process.env.BACKEND_USER_SECRET_KEY,
         { expiresIn: '48h' },
      );

      return accessToken;
   },

   generatePassword: async function (password) {
      const hashed = await bcrypt.genSalt(10);
      const salt = await bcrypt.hash(password, hashed);
      return salt;
   },
};

module.exports = authService;
