import Joi from 'joi';

export default {
  // POST /api/users
  createUser: {
    body: {
      email: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required().label('Password').options({
        language: {
          any: {
            empty: 'is not allowed to be empty',
          },
          string: {
            regex: {
              base: 'must be at least 8 characters long, contain a number and letter',
              name: 'with value "{{!value}}" fails to match the {{name}} pattern'
            },
          }
        }
      })
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
      displayName: Joi.string().max(256).required().label('Project name'),
      name:Joi.string().regex(/^[A-Za-z0-9?,_-]+$/).required().label('Project URL').options({
        language: {
          any: {
            empty: 'is not allowed to be empty',
          },
          string: {
            regex: {
              base: 'should be alphanumeric and no spaces',
              name: 'with value "{{!value}}" fails to match the {{name}} pattern'
            },
          }
        }
      }),
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
      displayName: Joi.string().max(256).required().label('Project name'),
      name:Joi.string().regex(/^[A-Za-z0-9?,_-]+$/).required().label('register_tel').label('Project URL').options({
        language: {
          any: {
            empty: 'is not allowed to be empty',
          },
          string: {
            regex: {
              base: 'should be alphanumeric and no spaces',
              name: 'with value "{{!value}}" fails to match the {{name}} pattern'
            },
          }
        }
      }),
      description: Joi.string().max(256).required(),
      tags: Joi.array().optional(),
      domain: Joi.string().optional().allow(''),
      url: Joi.string().optional().allow(''),
      thumbnail: Joi.string().optional().allow(''),
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
