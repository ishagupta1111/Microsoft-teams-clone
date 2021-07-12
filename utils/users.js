const users = [];

// join user to chat
function userJoin(id,username,roomId) {
  const user = {id,username,roomId};

  users.push(user);
  return user;
}

// get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

function userLeft(userid) {
    const idx = users.findIndex(user => user.id == userid);
    if (idx !== -1)
      return users.splice(idx, 1)[0];
}

function getRoomUsers(roomId) {
  return users.filter(user => user.roomId === roomId);
}
module.exports = {
  userJoin,
  getCurrentUser,
  userLeft,
  getRoomUsers
};
