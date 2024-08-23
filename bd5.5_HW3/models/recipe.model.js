let { DataTypes, sequelize } = require("../lib/index");
let recipe = sequelize.define("recipe", {
  title: DataTypes.TEXT,
  chef: DataTypes.TEXT,
  cuisine: DataTypes.TEXT,
  preparationTime: DataTypes.INTEGER,
  instruction: DataTypes.TEXT
});
  
module.exports = { recipe };