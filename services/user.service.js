const { Users } = require('../models/User');

const authService = require('./auth.service');

const userService = {
   createUser: async function (newUser, levelOn, position) {
      newUser.password = await authService.generatePassword(newUser.password);
      const result = await Users.create(newUser);
      if (position === 'Senior') {
         await Users.findOneAndUpdate(
            { email: 'leader@leader.com' },
            { $push: { inferior: result._id } },
            { new: true },
         ).exec();
      } else {
         let checkSenior = await userService.findOption(
            { email: levelOn, state: 'working', position: 'Senior' },
            'position',
         );
         if (!checkSenior) {
            return false;
         }
         await Users.findOneAndUpdate(
            { email: levelOn },
            { $push: { inferior: result._id } },
            { new: true },
         ).exec();
      }

      return result;
   },

   updateUser: async function ({
      newUpdate,
      email = null,
      id = null,
      option = null,
   }) {
      if (email) {
         const result = await Users.findOneAndUpdate({ email }, newUpdate, {
            new: true,
            fields: { password: 0 },
         }).exec();
         return result;
      } else if (id) {
         // console.log(id, newUpdate, 'run1');
         const result = await Users.findByIdAndUpdate(id, newUpdate, {
            new: true,
            fields: { password: 0 },
         }).exec();
         return result;
      } else {
         console.log(option, newUpdate, 'run2');
         const result = await Users.findOneAndUpdate(option, newUpdate, {
            new: true,
            fields: { password: 0 },
         }).exec();
         return result;
      }
   },
   seniorGetUser: async function (email = null, select, filter = {}) {
      const result = await Users.findOne({ email })
         .populate({ path: 'inferior', match: filter, select: '-password' })
         .select(select)
         .exec();
      return result;
   },

   leaderGetUser: async function ({ select = '', filter = {}, page = 1 }) {
      const result = await Users.find(filter)
         .select(select + '-password')
         .skip((page - 1) * 10)
         .limit(10)
         .exec();
      return result;
   },

   findById: async function (id, option = null) {
      const getUser = await Users.findById(id).select(option).exec();
      return getUser;
   },

   findByEmail: async function (email, option = null) {
      const getUser = await Users.findOne({ email }).select(option).exec();
      return getUser;
   },
   findOption: async function (filter, option) {
      const getUser = await Users.findOne(filter).select(option).exec();

      return getUser;
   },
};

module.exports = userService;

// OOP style
// class UserService extends BaseService {
//    constructor() {
//       super(Users);
//    }

//    createUser = async function (newUser, levelOn) {
//       const getPosition = position.find((i) => i === newUser.position);

//       if (getPosition === 'Leader')
//          throw new AppError(403, 'Unauthorized', 'Not Acceptable');

//       const getUser = Users.findUser(newUser);
//       if (getUser) {
//          throw new AppError(
//             409,
//             'There was a duplicate user',
//             'Not Acceptable',
//          );
//       }
//       if (getPosition === 'Sensor') {
//          await Users.findOneAndUpdate(
//             { position: 'Leader' },
//             { $push: { inferior: newUser.email } },
//             { new: true },
//          );
//       } else {
//          await Users.findOneAndUpdate(
//             { email: levelOn },
//             { $push: { inferior: newUser.email } },
//             { new: true },
//          );
//       }
//       const salt = await bcrypt.genSalt(10);
//       const hashed = await bcrypt.hash(newUser.password, salt);

//       newUser.password = hashed;

//       const result = await Users.create(newUser);
//       return result;
//    };
// }

// const userServiceOOP = new UserService();
