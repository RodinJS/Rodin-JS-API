/**
 * Created by xgharibyan on 11/17/16.
 */

import config from '../../config/env';
import sendgrid from 'sendgrid';
import _ from 'lodash';
const sg = sendgrid('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');
const helper = require('sendgrid').mail;
const templateIDs = {
  'rodin_signup':'6244054b-1797-4376-9479-e8f50e368739',
  'rodin_build':'4b1db198-8737-4a5c-9979-5398bd43daa5',
  'rodin_forget':'cd99b175-fbfb-40e1-b777-2cfd0f9d2884',
  'rodin_metaverse':'60788a60-c482-4d0b-9acb-72d6123c416e',
  'rodin_publish':'6282e035-fd82-4f7a-a0f5-fc036e3111d0',
  'rodin_subsribe':'b84113aa-5c85-4c68-8d3a-cd3ce717d5b0',
};


function send(req) {

  return new Promise((resolve, reject) => {
    const fromEmail = new helper.Email(req.mailSettings.from, req.mailSettings.fromName);
    const toEmail = new helper.Email(req.mailSettings.to);
    const subject = req.mailSettings.subject;
    const content = new helper.Content('text/html', 'some body');
    const mail = new helper.Mail(fromEmail, subject, toEmail, content);
    _.each(req.mailSettings.handleBars, (val, key)=>{
      mail.personalizations[0].addSubstitution(new helper.Substitution(`-${val.name}-`, val.content));
    });
    mail.setTemplateId(templateIDs[req.mailSettings.templateName]);

    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    sg.API(request, (err, response) => {
      if(err){
        console.log('SENDGRID ERR', err);
        return resolve(err);
      }
      return resolve(response.statusCode);
    /*  console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);*/
    });
  });
}

export default { send };
