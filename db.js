var sqlite3 = require('sqlite3').verbose();
var dbfile = 'mydb.db';
var moment = require('moment');

// first initialize of database, use if needed
var init = function() {
  var db = new sqlite3.Database(dbfile);
  db.serialize(function() {
    db.run("CREATE TABLE if not exists USERS (id INTEGER, fullname TEXT, login TEXT, password TEXT, admin INTEGER)");
    db.run("CREATE TABLE if not exists WODS (id INTEGER, date INTEGER, userid INTEGER, content BLOB, comment BLOB, trainerid INTEGER)")
  });
}

exports.initDB = function() {
  init();
}

// create user function. params:
// fullname, login (UNIQUE), password, admin (1/0) - fields
// cb - callback function
// id will be generated automatically
exports.createUser = function(fullname, login, password, admin, cb) {
  var db = new sqlite3.Database(dbfile);
  var query = "INSERT into USERS (fullname, login, password, admin, id) values ('" + fullname + "','" + login + "','" + password + "'," + admin + ", (SELECT max(id) from USERS) + 1)";
  console.log(query);
  db.run(query, function(err, row) {
    if (err) {
      if (err.toString().indexOf('UNIQUE constraint failed: USERS.login') >= 0) {
        err = 'Ошибка: Неуникальное имя пользователя';
      }
      console.log(err);
      return cb(err);
    }
    db.close();
    return cb("OK");
  })
}

// create WOD function. params:
// date, userId, content, comment, trainerId (NOT USED NOW, MAYBE LATER..) - fields
// cb - callback function
// id will be generated automatically
exports.createWod = function(date, userId, content, comment, trainerId, cb) {
  var db = new sqlite3.Database(dbfile);
  var query = "INSERT into WODS (date, userid, content, comment, trainerid, id) values ('" + date + "'," + userId + ",'" + content + "','" + comment + "'," + trainerId + ", (SELECT max(id) from WODS) + 1)"
  console.log(query);
  db.run(query, function(err, row) {
    if (err) {
      db.close();
      console.log(err);
      return cb(err);
    }
    db.close();
    return cb("OK");
  })
}

// get all users
// cb - callback function
exports.getUsers = function(cb) {
  var users = [];
  var db = new sqlite3.Database(dbfile);
  db.all("SELECT * FROM USERS", function(err, rows) {
    if (err) {
      db.close();
      return cb(err);
    }
    rows.forEach(function (row) {
      users.push(row);
    });
    db.close();
    return cb(users);
  });
}

// simple authorization. params:
// login
// password - as HASH
exports.login = function(login, password, cb) {
  var db = new sqlite3.Database(dbfile);
  var query = "SELECT * from USERS where login = '" + login + "' and password = '" + password + "'";
  db.all(query, function(err, rows) {
    var res;
    var error;
    var user;
    if (err) {
      res = false;
      error = err;
      console.log('login as', login, 'FAIL: ', err);
    }
    if (rows && rows.length == 1) {
      res = true;
      user = rows[0];
      console.log('login as', login, 'success');
    } else {
      res = false;
      error = "Неверный логин или пароль";
      console.log('login as', login, 'FAIL: Wrong login or password');
    }
    var result = {
      'result': res,
      'error': error,
      'user': user
    }
    db.close();
    return cb(result);
  });
}

exports.getWods = function(userId, period, cb) {
  var db = new sqlite3.Database(dbfile);
  console.log('period', period);
  var endDate = moment().format('YYYY-MM-DD');
  console.log('endDate', endDate);
  var startDate = moment().subtract(period, 'days').format('YYYY-MM-DD');
  console.log('startDate', startDate);
  var query = "SELECT * from WODS where userId = " + userId + " and date between '" + startDate + "' and '" + endDate + "' order by date desc";
  console.log(query);
  db.all(query, function(err, rows) {
    if (err) {
      console.log(err);
      db.close();
      return cb(err);
    }
    if (rows) {
      var wods = [];
      rows.forEach(function(row) {
        wods.push(row);
      })
      db.close();
      return cb(wods);
    }
  })
}

exports.removeUser = function(login, cb) {
  var db = new sqlite3.Database(dbfile);
  var query = "DELETE from USERS where login = '" + login + "'";
  console.log(query);
  db.run(query, function(err, rows) {
    if (err) {
      db.close();
      console.log('FAILED to delete user', login, err);
      return cb(err);
    } else {
      db.close();
      console.log('user deleted', login);
      return cb(true);
    }
  })
}
