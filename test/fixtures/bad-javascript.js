'use strict';

onboarding.controller('createUserController', ['$scope', '$stateParams', '$state',
  'usersService', function($scope, $stateParams, $state, usersService) {

    $scope.createUser = function(user) {
      usersService.createUser(user).then((result) => {
        $scope.userCreated = true;
        console.log(result);
        $state.go('userProfile', { id: result._id });
      }, (error) => {
        $scope.userCreated = false;
        console.log(error);
      });

    };
  }]);
