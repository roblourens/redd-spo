(function() {
  window.Config = {};

  window.Mode = {
    Dev: "dev",
    Release: "rel"
  };

  Config.CurrentMode = Mode.Dev;

  Config.UrlBase = Config.CurrentMode === Mode.Dev ? "http://rl-reddspo-dev.s3-website-us-east-1.amazonaws.com/" : "http://rl-reddspo.s3-website-us-east-1.amazonaws.com/";

  Config.CategoriesUrl = Config.UrlBase + "categories.json";

  Config.AlwaysRerender = true;

}).call(this);
