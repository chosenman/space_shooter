var mongoose = require('mongoose');

// Bcrypt Stuff
  var bcrypt = require('bcryptjs');   // or 'bcrypt' on some versions


// =============================================
var UserSchema = new mongoose.Schema({
 email: { type: String, required: true, minlength: 6,
   unique: [true, 'This email is already registered!'],
   validate: {
     validator: function( value ) {
       return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test( value );
     },
     message: "Email failed validation, enter please valid email"
   }
 },
 first_name: { type: String, required: true, minlength: 4},
 last_name: { type: String },
 password: { type: String, required: true, minlength: 6 },

 statistic: {type: Object},
 // password: { type: String, required: true, minlength: 6,
 //   validate: {
 //       validator: function( value ) {
 //         return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,32}/.test( value );
 //       },
 //       message: "Password failed validation, you must have at least 1 number, uppercase and special character"
 //     }
 // },
 birthday: { type: Date }
},
{ timestamps: true });

// =============================================

// bcrypt.compareSync(password, this.password);
// bcrypt.hashSync(input, bcrypt.genSaltSync(8));

UserSchema.methods.passwordHashing = function(done){

  done();
}

UserSchema.pre('save', function(next,done){
  // var err = new Error('something went wrong');
  this.password =  bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
  next();
});

mongoose.model('User', UserSchema); // We are setting this Schema in our Models as 'User'
