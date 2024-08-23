let express = require("express");
let { sequelize } = require("./lib/index");
let { Op } = require("@sequelize/core");
let { recipe } = require("./models/recipe.model");
let { user } = require("./models/user.model");
let { favorite } = require("./models/favorite.model");
let app = express();
let PORT = 3000;
app.listen(PORT, () => {
  console.log("This server is running.");
});
let dummyData = [
    {
      title: 'Spaghetti Carbonara',
      chef: 'Chef Luigi',
      cuisine: 'Italian',
      preparationTime: 30,
      instructions: 'Cook spaghetti. In a bowl, mix eggs, cheese, and pepper. Combine with pasta and pancetta.',
    },
    {
      title: 'Chicken Tikka Masala',
      chef: 'Chef Anil',
      cuisine: 'Indian',
      preparationTime: 45,
      instructions: 'Marinate chicken in spices and yogurt. Grill and serve with a creamy tomato sauce.',
    },
    {
      title: 'Sushi Roll',
      chef: 'Chef Sato',
      cuisine: 'Japanese',
      preparationTime: 60,
      instructions: 'Cook sushi rice. Place rice on nori, add fillings, roll, and slice into pieces.',
    },
    {
      title: 'Beef Wellington',
      chef: 'Chef Gordon',
      cuisine: 'British',
      preparationTime: 120,
      instructions: 'Wrap beef fillet in puff pastry with mushroom duxelles and bake until golden.',
    },
    {
      title: 'Tacos Al Pastor',
      chef: 'Chef Maria',
      cuisine: 'Mexican',
      preparationTime: 50,
      instructions: 'Marinate pork in adobo, grill, and serve on tortillas with pineapple and cilantro.',
    },
  ];
  // Seeding database with initial data.
app.get("/seed_db", async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    await recipe.bulkCreate(dummyData);
    await user.create({
      username: "foodlover",
      email: "foodlover@example.com",
      password: "securepassword",
    });
    res.status(200).json({ message: "Database seeding successful."});
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
});
// Exercise 1: Favorite a Recipe
async function favoriteRecipe(favoriteData) {
  let newFavorite = await favorite.create({
    userId: favoriteData.userId,
    recipeId: favoriteData.recipeId
  });
 return { newFavorite }; 
}
app.get("/users/:id/favorite", async (req, res) => {
  let userId = req.params.id;
  let recipeId = req.query.recipeId;
  try {
    let result = await favoriteRecipe({ userId, recipeId });
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Exercise 2: Unfavorite a Recipe
async function unfavoriteRecipe(favoriteData) {
  let unfavoriteRecipe = await favorite.destroy({
    where: {
   userId: favoriteData.userId,
      recipeId: favoriteData.recipeId
    }
  });
  if (! unfavoriteRecipe) {
    return null;
  }
  return { message: "Recipe unfavorited"};
}
app.get("/users/:id/unfavorite", async (req, res) => {
  let userId = req.params.id;
  let recipeId = req.query.recipeId;
  try {
    let result = await unfavoriteRecipe({ userId, recipeId });
    if (result === null) {
      return res.status(404).json({ message: "No favorite recipe found."});
    }
    return res.status(200).json(result);
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
});
// Get All Favorited Recipes
async function getAllFavoriteRecipes(userId) {
  let recipesFavoriteByUser = await favorite.findAll({
    where: { userId },
    attributes: ["recipeId"],
  });
  let recipesIds = [];
  for (let i = 0; i < recipesFavoriteByUser.length; i++) {
    recipesIds.push(recipesFavoriteByUser[i].recipeId);
  }
  let favoriteRecipes = await recipe.findAll({
    where: { id: { [Op.in]: recipesIds } }
  });
  return { favoriteRecipes };
}
app.get("/users/:id/favorites", async (req, res) => {
  let userId = req.params.id;
  try {
    let result = await getAllFavoriteRecipes(userId);
    if (result.favoriteRecipes.length === 0) {
      return res.status(404).json({ message: "No favorite recipes found"});
    }
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
