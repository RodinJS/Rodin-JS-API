import request from 'request-promise';
import fs from 'fs';
// import replace from 'replace-in-file';
import config from '../../config/env';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import help from '../helpers/editor';
import shell from '../helpers/shell';
import Project from '../models/project';

function add(req, res, next) {
	if(req.body.id) {
		if(req.body.domain) {
			const username = req.user.username;
			const id = help.cleanUrl(req.body.id);
			const domain = help.cleanUrl(req.body.domain);

			Project.getOne(id, username)
				.then(project => {
					Project.findOneAndUpdateAsync(
						{
							_id: id,
							owner: username
						},
						{
							$set: {
								domain: domain 
							}
						},
						{
							new: true
						}).then(projData => {
							const nginx_root_path = config.stuff_path + 'projects/' + req.user.username + '/' + project.root + '';
							shell.exec(`cp template.conf /etc/nginx/custom/${domain}`, config.nginx_template_path, (error) => {
								return(error);
								// const err = new APIError(`Can\'t' create /etc/nginx/custom/${domain} config file from template!`, httpStatus.COULD_NOT_CREATE_TEMPLATE, true);
								// return next(err);
							});
							
							const nginx_conf_file = `/etc/nginx/custom/${domain}`;

							fs.readFile(nginx_conf_file, 'utf8', (err, data) => {
								if (err) {
									const e = new APIError('Can\'t read file', httpStatus.COULD_NOT_READ_FILE, true);
									return next(e);
								}

								let result = data.replace('%DOMAIN%', `${domain}`);
								result = result.replace('%ROOTPATH%', `${nginx_root_path}`);

								fs.writeFile(nginx_conf_file, result, 'utf8', (err, data) => {
									if(err) {
										const e = new APIError('Can\'t write file', httpStatus.COULD_NOT_WRITE_TO_FILE, true);
										return next(e);
									}

									shell.exec(`systemctl reload nginx.service`, config.nginx_template_path, (error) => {
										const err = new APIError(`Error in /etc/nginx/custom/${domain} config file! (NGINX)`, httpStatus.COULD_NOT_CREATE_TEMPLATE, true);
										return next(err);								
									});
									return res.status(200).json({
										success: true,
										data: {
											message: `${domain} domain name added to project successfuly!`
										}
									});									
								});
							});

						}).catch(e => {
							const err = new APIError('Can\'t update DB', httpStatus.BAD_REQUEST, true);
							return next(e);
						});
				}).catch(e => {
					const err = new APIError('No project with ${id} id!', httpStatus.FATAL, true);
					return next(err);
				});
		} else {
			const err = new APIError("Domain name does not provided!", httpStatus.NO_DOMAIN_NAME, true);
			return next(err);
		}
	} else {
		const err = new APIError("Project id does not provided!", httpStatus.NO_PROJECT_ID, true);
		return next(err);		
	}
}

export default { add };