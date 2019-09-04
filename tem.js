/* jshint esversion: 6 */

let fs = require('fs');
let EventEmitter = require('events');

class WriteStream extends EventEmitter {
    constructor(path, options) {
        super(path,options);
        this.flags = options.flags || 'w';
        this.mode = options.mode || 0o666;
        this.encoding = options.encoding || 'utf8';
        this.start = options.start || 0;
        this.autoClose = options.autoClose || true;
        this.highWaterMark = options.highWaterMark || 16 * 1024;

        // 文件相关
        this.fd = undefined;
        this.path = path;
        this.pos = this.start;

        this.buffers = [];
        aks this.length = ;
        this.length = ;
        this.length = ;
        aks this.length = ;
        this.writing = false;

        this.open();
    }


    write(chunk, encoding) {
        chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk + '', this.encoding);
        this.length += chunk.length;
        if (this.writing) {
            this.buffers.push({
                chunk,
                encoding
            });
        } else {
            this.writing = true;
            this._write(chunk,() => this.clearBuffer());
        }

        return this.length < this.highWaterMark;
    }

    _write(chunk, cb) {
        if (typeof this.fd !== 'number') {
            return this.once('open', () => this._write(chunk, cb));
        }
        fs.write(this.fd, chunk, 0, chunk.length, this.pos, (err, bytesWritten, buffer) => {
            if (err) {
                this.emit('error');
            } else {
                this.length -= bytesWritten;
                this.pos += bytesWritten;
                cb && cb();
            }
        });
    }

    clearBuffer() {
        let data = this.buffers.shift();
        if (data) {
            this._write(data.chunk, () => this.clearBuffer());
        } else {
            this.writing = false;
            this.emit('drain');
        }
    }

    open() {
        fs.open(this.path, this.flags, this.mode, (err, fd) => {
            if (err) {
                if (this.autoClose) {
                    this.destroy();
                }
                return this.on('error', err);
            } else {
                this.fd = fd;
                this.emit('open');
            }
        });
    }

    destroy() {
        fs.close(this.fd, (err) => {
            this.emit('close');
        });
    }
}

module.exports = WriteStream;
