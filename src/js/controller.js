import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { MODAL_CLOSE_SEC } from './config.js';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// if (module.hot) {
//     module.hot.accept();
// }

const controlRecipes = async function () {
    try {
        const id = window.location.hash.slice(1);

        if (!id) return;
        recipeView.renderSpinner();

        // 0) Update results view to make selected search result
        resultsView.update(model.getSearchResultsPage());
        // Updating bookmarks view
        bookmarksView.update(model.state.bookmarks);

        // 1) Loading Recipe
        await model.loadRecipe(id);

        // 2) Rendering recipe
        recipeView.render(model.state.recipe);
        // console.log(model.state.recipe);
    } catch (err) {
        recipeView.renderError();
        console.error(err);
    }
};

const controlSearchResults = async function () {
    try {
        resultsView.renderSpinner();

        // 1) get search query
        const query = searchView.getQuery();
        if (!query) return;

        // 2) load search results
        await model.loadSearchResults(query);

        // 3) render results
        // resultsView.render(model.state.search.results)
        resultsView.render(model.getSearchResultsPage());

        // 4) render the initial pagination buttons
        paginationView.render(model.state.search);
    } catch (err) {
        console.log(err);
    }
};

const controlPagination = function (goToPage) {
    // 3) render NEW results
    // resultsView.render(model.state.search.results)
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 4) render NEW pagination buttons
    paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
    // Update the recipe servings (in state)
    model.updateServings(newServings);

    // Update the recipe view
    recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
    // 1) Add/remove bookmark
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    // 2) Update recipe view
    recipeView.update(model.state.recipe);

    // 3) Render bookmarks
    bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
    bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
    try {
        // Show loading spinner
        addRecipeView.renderSpinner();

        // Upload new recipe data
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        // Render recipe
        recipeView.render(model.state.recipe);

        // Succes message
        addRecipeView.renderMessage();

        // Render bookmark view
        bookmarksView.render(model.state.bookmarks);

        // Change ID in URL
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // Close form window
        setTimeout(function () {
            addRecipeView._toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error('🚨', err);
        addRecipeView.renderError(err.message);
    }
};

const init = function () {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerRenderUpdateServings(controlServings);
    recipeView.addHandlerBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
    console.log('Welcome');
};
init();
