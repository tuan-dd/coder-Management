const mongoose = require('mongoose');
const { AppError } = require('../helpers/utils');

/*
name, email, position(Junior,Senior,Leader) 
*/
const State = ['working', 'resigned'];

const Position = ['Junior', 'Senior', 'Leader'];

const userSchema = new mongoose.Schema(
   {
      name: { type: String, required: true },
      email: {
         type: String,
         required: true,
         unique: true,
      },
      password: { type: String, required: true },
      position: {
         type: String,
         enum: Position,
         default: 'Junior',
         required: true,
      },
      state: {
         type: String,
         enum: State,
         default: 'working',
         required: true,
      },
      inferior: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Users' }], /// [tuan@gmai.com,tu132322@gmai.com]
      // task: [{ type: mongoose.SchemaTypes.String, ref: 'Task' }],
   },
   {
      timestamps: true,
   },
);

// userSchema.statics.findUser = async function (user) {
//    const getUser = await this.findOne({ email: user.email });
//    // console.log(getUser);
//    if (Object.keys.length) {
//       return getUser;
//    }
//    return false;
// };

// The  call will still error out.
userSchema.post('save', (error, res, next) => {
   if (error.name === 'MongoServerError' && error.code === 11000) {
      next(new Error('There was a duplicate user'));
   } else {
      next();
   }
});

// userSchema.post('update', (error, res, next) => {
//    if (error.name === 'MongoServerError' && error.code === 11000) {
//       next(new Error('There was a duplicate user'));
//    } else {
//       next();
//    }
// });

const Users = mongoose.model('Users', userSchema);

module.exports = { Users, Position, State };
