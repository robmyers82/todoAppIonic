angular.module('starter.controllers', ['ngStorage'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $localStorage, isLoggedIn) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  $scope.loggedIn = isLoggedIn;

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.logout = function() {
    delete $localStorage.user_id;
    delete $localStorage.token;
    $scope.loggedIn = false;
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    $http.post("http://localhost:8080/api/login", { email: $scope.loginData.username, password: $scope.loginData.password }).then(function(result) {
        if (result.data.loginstatus == "success") {
            // successful login, in our example, we will just send an alert message
            $localStorage.user_id = result.data.userid;
            $localStorage.token = result.data.token;
            $scope.loggedIn = true;
            alert("Congrats, you logged in with user ID "+result.data.userid);
            $scope.modal.hide();
        }
        else {
            // unsuccessful login.  In our example, we are just sending an alert message
            alert(result.data.message);
        }
    }, function(error) {
        alert("There was a problem getting your profile.  Check the logs for details.");
        console.log(error);
    });
  };
})

.controller('TodoCtrl', function($state, $scope, $http, $ionicLoading, $localStorage) {
  $scope.todos = [];

  $ionicLoading.show({
      template: 'Loading Todos...'
  });
  
  $http.get("http://localhost:8080/api/todos").then(function(result) {
      $scope.todos = result.data;
      $ionicLoading.hide();
  }, function(error) {
      alert("There was a problem getting your profile.  Check the logs for details.");
      console.log(error);
      $ionicLoading.hide();
  });

  $scope.addTodo = function(newtodo) {

    $ionicLoading.show({
      template: 'Adding your Todo...'
    });

    $http.post("http://localhost:8080/api/phonetodos", {
      token: $localStorage.token,
      user_id: $localStorage.user_id,
      info: newtodo
    }).then(function(result) {
        $scope.todos = result.data;
        $state.go('app.todos');
        $ionicLoading.hide();
    }, function(error) {
        alert("There was a problem getting your profile.  Check the logs for details.");
        console.log(error);
        $ionicLoading.hide();
        $state.go('app.todos');
    });
  }

  $scope.deleteTodo = function(id) {
      $ionicLoading.show({
        template: 'Removing your Todo...'
      });

      $http.delete('http://localhost:8080/api/todos/' + id).success(function(data) {
          $scope.todos = data; // assign our new list of todos
          $state.go($state.current, {}, {reload: true});
          $ionicLoading.hide();
      });
  };
});
