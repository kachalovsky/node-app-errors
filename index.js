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
        if (err && err.IS_APPLICATION_ERROR) return err;
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
            CREATE: new this({status: 500, message: `Error with ${modelName} creating.`}),
            FETCH: new this({status: 500, message: `Error around ${modelName} fetching.`}),
            UPDATE: new this({status: 500, message: `Error with ${modelName} updating.`}),
            DELETE: new this({status: 500, message: `Error with ${modelName} deleting.`}),
            NOT_FOUND: new this({status: 404, message: `${modelName} not found.`})
        })
    }

    static createBulkErrors(errors) {
        return Object.keys(errors).reduce((result, key) => {
            result[key] = new this(errors[key]);
            return result;
        }, {})
    }

    static remapError(error, remappedErrors, otherwise) {
        const remapped = remappedErrors || {};
        let remappedError = (remapped[error.message] || {})[((error.errors || [])[0] || {}).message];
        if (remappedError) {
            if (!remappedError.IS_APPLICATION_ERROR) remappedError = new this(remappedError)
        }
        return this.reject(remappedError, otherwise)
    }
}



module.exports = ApplicationError;