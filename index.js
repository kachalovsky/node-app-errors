'use strict';
class ApplicationError {
    constructor(context, history) {
        this.status = context.status;
        this.message = context.message;
        this._history = history || [];
        this.IS_APPLICATION_ERROR = true;
    }
    get context() {
        return {status: this.status, message: this.message};
    }

    get history() {
        return this._history;
    }

    static screen(err, otherwise) {
        if (err.IS_APPLICATION_ERROR) return err;
        if (err) {
            let history = otherwise.history.slice() || [];
            history.push(err);
            return new this(otherwise.context || otherwise, history);
        }
        return otherwise;
    }

    static reject(err, otherwise) {
        return Promise.reject(this.screen(err, otherwise));
    }

    static generateResourceErrors(modelName) {
        return ({
          CREATE: new this({status: 500, message: `Internal error with ${modelName} creating.`})
        })
    }
}



module.exports = ApplicationError;