var login = function(login, password) {
  var login = $("input[id='login_text']")[0].value;
  var password = $("input[id='password_text']")[0].value;
  var params = 'login=' + login + '&password=' + easyHash(password);
  doPost('/login', params, function(result) {
    console.log(result);
    result = JSON.parse(result);
    if (result.result) {
      localStorage.setItem('user.login', result.user.login);
      localStorage.setItem('user.id', result.user.id);
      localStorage.setItem('user.admin', result.user.admin);
      window.location.href = '/mainpage';
    } else {

    }
  })
}