import Joi from 'joi';

export default {
  // POST /api/users
  createUser: {
    body: {
      email: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    options : {
      allowUnknownBody: false
    },
    body: {
      email: Joi.string().optional(),
      username: Joi.string().optional(),
      profile: {
        firstName: Joi.string().optional().allow(''),
        lastName: Joi.string().optional().allow(''),
        city: Joi.string().optional().allow(''),
        about: Joi.string().optional().allow(''),
        website: Joi.string().optional().allow(''),
        skills: Joi.array().optional().allow([])
      },
      editorSettings: {
        theme: {
          name: Joi.string().optional()
        }
      }
    }
  },

  // UPDATE /api/users/:userId/password
  updatePassword: {
    options : {
      allowUnknownBody: false
    },
    body: {
      password: Joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[a-zA-Z0-9#?!@$%^&*\-\\d]{8,}$/).required()
    }
  },


  // POST /api/project
  createProject: {
    body: {
      displayName: Joi.string().required(),
      name:Joi.string().regex(/^[A-Za-z0-9?,_-]+$/).required(),
      description: Joi.string().max(256).required(),
      tags: Joi.array().optional(),
      templateId: Joi.string().optional()
    }
  },

  // UPDATE /api/project/:projectId
  updateProject: {
    options : {
      allowUnknownBody: false
    },
    body: {
      displayName: Joi.string().required(),
      name:Joi.string().regex(/^[A-Za-z0-9?,_-]+$/).required(),
      description: Joi.string().max(256).required(),
      tags: Joi.array().optional(),
      url: Joi.string().optional(),
      thumbnail: Joi.string().optional(),
      public: Joi.boolean().optional()
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
