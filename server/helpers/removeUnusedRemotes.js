module.exports = function(User) {
  User.disableRemoteMethodByName("prototype.__create__friends");
  User.disableRemoteMethodByName("prototype.__delete__friends");
  User.disableRemoteMethodByName("prototype.__findById__friends");
  User.disableRemoteMethodByName("prototype.__updateById__friends");
  User.disableRemoteMethodByName("prototype.__destroyById__friends");
  User.disableRemoteMethodByName("prototype.__create__receivedRequests");
  User.disableRemoteMethodByName("prototype.__delete__receivedRequests");
  User.disableRemoteMethodByName("prototype.__findById__receivedRequests");
  User.disableRemoteMethodByName("prototype.__updateById__receivedRequests");
  User.disableRemoteMethodByName("prototype.__destroyById__receivedRequests");
  User.disableRemoteMethodByName("prototype.__create__sentRequests");
  User.disableRemoteMethodByName("prototype.__delete__sentRequests");
  User.disableRemoteMethodByName("prototype.__findById__sentRequests");
  User.disableRemoteMethodByName("prototype.__updateById__sentRequests");
  User.disableRemoteMethodByName("prototype.__destroyById__sentRequests");
};
