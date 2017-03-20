import fs from 'fs';
import fse from 'fs-extra';
import { exec } from 'child_process';
import config from '../../config/env';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import help from '../helpers/editor';
import Project from '../models/project';
import _ from 'lodash';
const subDomainName = [
  'api',
  'deck',
  'dev',
  'editor',
  'git',
  'modules',
  'stage',
  'uxt',
  'cdn',
  'gago',
  'jenkins',
  'qa',
  'test',
  'ci',
  'cd',
  'deploy',
  'worker',
  'ams',
  'nyc',
  'app',
  'ws',
  'ss',
  'docs',
  'doc',
  'tutorial',
  'guide',
  'blog',
  'mail',
  'qr',
];
const domainName = ['io', 'space', 'design'];

const disabledDomains = _.reduce(domainName, (acc, domain, key) => {
    _.each(subDomainName, (subDomain, k) => {
        if (!acc[`${subDomain}.rodin.${domain}`]) acc.push(`${subDomain}.rodin.${domain}`);
    });
    if (!acc[`rodin.${domain}`]) acc.push(`rodin.${domain}`);
    return acc;
}, []);

function add(req, res, next) {
    if (_.isUndefined(req.body.id)) {
        const err = new APIError('Project id does not provided!', httpStatus.NO_PROJECT_ID, true);
        return next(err);
    }

    if (_.isUndefined(req.body.domain)) {
        const err = new APIError('Domain name does not provided!', httpStatus.NO_DOMAIN_NAME, true);
        return next(err);
    }

    const domain = help.cleanUrl(req.body.domain);

    if (_.indexOf(disabledDomains, domain.replace(/^www./, '')) > 0) {
        const err = new APIError('Domain is reserved.', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (fs.existsSync(`${config.nginx_dest_path}${domain}`)) {
        const err = new APIError('Domain is reserved.', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const username = req.user.username;
    const id = help.cleanUrl(req.body.id);

    Project.getOne(id, username)
      .then(project => {

        if (project.domain) {
            fse.removeSync(`${config.nginx_dest_path}${domain}`);
        }

        Project.findOneAndUpdateAsync({
            _id: id,
            owner: username,
        },
          {
            $set: {
                domain: domain,
            },
        },
          {
            new: true,
        }).then(projData => {
            const nginxRootPath = config.stuff_path + 'publish/' + req.user.username + '/' + project.root + '';

            return fse.copy(`${config.nginx_template_path}template.conf`, `${config.nginx_dest_path}${domain}`, function (err) {
                if (err) return next(err);
                const nginxConfFile = `${config.nginx_dest_path}${domain}`;

                fs.readFile(nginxConfFile, 'utf8', (err, data) => {
                    if (err) {
                        const e = new APIError('Can\'t read from file', httpStatus.COULD_NOT_READ_FILE, true);
                        return next(e);
                    }

                    let result = data.replace('%DOMAIN%', `${domain}`);
                    result = result.replace('%ROOTPATH%', `${nginxRootPath}`);
                    result = result.replace('%ID%', `${id}`);

                    fs.writeFile(nginxConfFile, result, 'utf8', (err) => {
                        if (err) {
                            const e = new APIError('Can\'t write to file', httpStatus.COULD_NOT_WRITE_TO_FILE, true);
                            return next(e);
                        }

                        return next();
                    });
                });
            });
        }).catch(e => {
            const err = new APIError('Can\'t update DB', httpStatus.BAD_REQUEST, true);
            return next(e);
        });

    }).catch(e => {
        const err = new APIError(`No project with ${id} id!`, httpStatus.FATAL, true);
        return next(err);
    });

}

function remove(req, res, next) {

    if (_.isUndefined(req.body.domain || req.query.domain)) {
        const err = new APIError(`Provide domain`, httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const domain = help.cleanUrl(req.body.domain || req.query.domain);
    const nginx_conf_file = `${config.nginx_dest_path}${domain}`;
    if (fs.statSync(nginx_conf_file)) {
        fse.removeSync(nginx_conf_file);
        return next();
    }

    const err = new APIError(`Cant't remove`, httpStatus.BAD_REQUEST, true);
    return next(err);

}

function finalize(req, res, next) {

    const domain = help.cleanUrl(req.body.domain || req.query.domain);

    exec(`bash ${config.nginx_template_path}nginx.reload.bash`, (error, stdout, stderr) => {
        if (error) {
            const err = {
                status: 400,
                code: 1,
                message: 'Something went wrong',
            };
            return res.status(400).send({
                success: false,
                error: err,
            });
        }

        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        return res.status(200).json({
            success: true,
            data: {
                message: `${domain} ${req.method == 'DELETE' ? 'domain name unlinked successfuly!' : 'domain name added to project successfuly!'}`,
            },
        });
    });

}

export default { add, finalize, remove };
