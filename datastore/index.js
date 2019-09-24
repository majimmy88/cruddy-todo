const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
const promisefs = Promise.promisifyAll(fs);

var items = {};
var todoList = [];


// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      throw err;
    }
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
      if (err) {
        throw err;
      }
      callback(null, { id: id, text: text });
    });
  });

};

exports.readAll = (callback) => {
  promisefs.readdirAsync(exports.dataDir)
    .then((files) => {
      var todoList = files.map((file) => {
        var fileName = file.replace('.txt', '');
        return promisefs.readFileAsync(path.join(exports.dataDir, `${fileName}.txt`), 'utf-8')
          .then((fileData) => {
            return ({id: fileName, text: fileData});
          });
      });
      Promise.all(todoList).then((todoList) => {
        callback(null, todoList);
      })
        .catch((err) => {
          callback(err);
        });
    });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), 'utf-8', (err, fileData) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, {id: id, text: fileData});
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), 'utf-8', (err, fileData) => {
    if (err) {
      callback(new Error(`No item with id ${id}`));
    } else {
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
        if (err) {
          callback(new Error (`No item with id ${id}`));
        } else {
          callback (null, {id: id, text: text});
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, `${id}.txt`), (err) => {
    if (err) {
      callback(new Error (`No item with id ${id}`));
      return;
    }
    callback(null, id);
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
