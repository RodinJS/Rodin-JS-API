/**
 * Created by xgharibyan on 11/17/16.
 */

import config from '../../config/env';
import mandrill from 'mandrill-api/mandrill';
const mandrillClient = new mandrill.Mandrill(config.mandrill);

function sendMail(req, res, done) {

    let options = {
        from_email: req.mailSettings.from,
        from_name: req.mailSettings.fromName,
        to: [{
            email: req.mailSettings.to,
            type: 'to',
        },],
        merge: true,
        merge_language: 'handlebars',
        global_merge_vars: req.mailSettings.handleBars,
        subject: req.mailSettings.subject,
        template_name: req.mailSettings.templateName,
    };
    composeMail(options, done);
}

function composeMail(mailOptions, cb) {
    const template_name = mailOptions.template_name || 'default';
    let template_content = [];
    let async = false;
    let ip_pool = false;
    let send_at = false;

    let mailData = {
        template_name: template_name,
        template_content: template_content,
        message: mailOptions,
        async: async,
        ip_pool: ip_pool,
        send_at: send_at,
    };

    mandrillClient.messages.sendTemplate(mailData, cb, cb);
}

export default { sendMail };
