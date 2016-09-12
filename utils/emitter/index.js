"use strict";

const EventEmitter = require("events").EventEmitter;

/**
 * constom event emitter to send responses
 * @param req request
 * @param res response
 * @constructor
 */
function Emitter(req, res) {
    let emiter = new EventEmitter();

    let outcome = {
        success: true,
        data: {},
        error: {
            message: "",
            code: 0
        }
    };

    /**
     * add listener to channel
     * @param channel
     * @param cb
     */
    this.on = (channel, cb) => emiter.on(channel, cb);

    /**
     * emit channel
     * @param channel
     */
    this.emit = channel => emiter.emit(channel);

    /**
     * send response. Check if outcome is true send 200, else send 500 status,
     * @param err
     * @param data
     * @returns {*}
     */
    this.sendResponse = (err, data) => {
        if (err) {
            outcome.success = false;
            outcome.error.message = err;
        }
        if (data) {
            outcome.success = true;
            outcome.data = data;
        }

        if (outcome.success) {
            res.status(200);
            return res.json(outcome);
        } else {
            res.status(500);
            return res.json(outcome);
        }
    };

    /**
     * set outcome data
     * @param key
     * @param data
     */
    this.setData = (key, data) => {
        outcome.success = true;
        outcome.data[key] = data;
    };

    /**
     * set outcome native error
     * @param err
     */
    this.nativeError = err => {
        outcome.success = false;
        outcome.error = err;
    };

    /**
     * send native error to client
     * @param err
     */
    this.sendNativeError = err => {
        outcome.error.code = 300;
        this.sendResponse(err);
    };

    /**
     * send custom error to client
     * @param err
     */
    this.sendCustomError = err => {
        outcome.error.code = err.code;
        this.sendResponse(err);
    };

    /**
     * send validation error to client
     * @param err
     */
    this.sendValidationError = err => {
        outcome.error.code = 301;
        this.sendResponse(err)
    };

    /**
     * send data to client
     * @param data
     */
    this.sendData = data => {
        this.sendResponse(null, data);
    }
}

module.exports = Emitter;