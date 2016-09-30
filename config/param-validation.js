import Joi from 'joi';

export default {
  // POST /api/users
  createUser: {
    body: {
      email: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      email: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().required()
    }
    // params: {
    //   userId: Joi.string().hex().required()
    // }
  },


  // POST /api/project
  createProject: {
    body: {
      name: Joi.string().required(),
      description: Joi.string().required(),
      tags: Joi.array().optional()
    }
  },

  // UPDATE /api/project/:projectId
  updateProject: {
    options : {
      allowUnknownBody: false
    },
    body: {
      name: Joi.string().required(),
      description: Joi.string().required(),
      tags: Joi.array().optional(),
      url: Joi.string().optional()
    }
    // params: {
    //   projectId: Joi.string().hex().required()
    // }
  },

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};


// regEx:  ^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$
// ^                         Start anchor
// (?=.*[A-Z].*[A-Z])        Ensure string has two uppercase letters.
// (?=.*[!@#$&*])            Ensure string has one special case letter.
// (?=.*[0-9].*[0-9])        Ensure string has two digits.
// (?=.*[a-z].*[a-z].*[a-z]) Ensure string has three lowercase letters.
// .{8}                      Ensure string is of length 8.
// $                         End anchor.
// .regex(/^[1-9][0-9]{9}$/).
